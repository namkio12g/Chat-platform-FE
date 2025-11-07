import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Channel,
  Message,
  DirectMessage,
  Notification,
} from '@/services/api';

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender: {
    id: number;
    username: string;
  };
  media: Array<{
    id: number;
    url: string;
    filename: string;
    mime_type: string;
  }>;
}

interface ConversationPagination {
  offset: number;
  total: number;
  hasMore: boolean;
}

interface ChatState {
  channels: Channel[];
  messages: { [channelId: number]: Message[] };
  directMessages: DirectMessage[];
  notifications: Notification[];
  currentChannel: number | null;
  currentDirectMessage: number | null;
  // Conversation messages
  conversationMessages: { [conversationId: number]: ConversationMessage[] };
  conversationPagination: {
    [conversationId: number]: ConversationPagination;
  };
  currentConversation: number | null;
  conversationDetails: {
    [conversationId: number]: {
      id: number;
      type: 'direct' | 'group';
      name: string | null;
      members: Array<{
        user_id: number;
        role: string;
        user: {
          id: number;
          username: string;
        };
      }>;
      created_at: string;
    };
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  channels: [],
  messages: {},
  directMessages: [],
  notifications: [],
  currentChannel: null,
  currentDirectMessage: null,
  conversationMessages: {},
  conversationPagination: {},
  currentConversation: null,
  conversationDetails: {},
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    addChannel: (state, action: PayloadAction<Channel>) => {
      state.channels.push(action.payload);
    },
    updateChannel: (state, action: PayloadAction<Channel>) => {
      const index = state.channels.findIndex(
        (channel) => channel.id === action.payload.id
      );
      if (index !== -1) {
        state.channels[index] = action.payload;
      }
    },
    deleteChannel: (state, action: PayloadAction<number>) => {
      state.channels = state.channels.filter(
        (channel) => channel.id !== action.payload
      );
    },

    setMessages: (
      state,
      action: PayloadAction<{ channelId: number; messages: Message[] }>
    ) => {
      state.messages[action.payload.channelId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const channelId = action.payload.channelId;
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      state.messages[channelId].push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const channelId = action.payload.channelId;
      if (state.messages[channelId]) {
        const index = state.messages[channelId].findIndex(
          (msg) => msg.id === action.payload.id
        );
        if (index !== -1) {
          state.messages[channelId][index] = action.payload;
        }
      }
    },
    deleteMessage: (
      state,
      action: PayloadAction<{ channelId: number; messageId: number }>
    ) => {
      const { channelId, messageId } = action.payload;
      if (state.messages[channelId]) {
        state.messages[channelId] = state.messages[channelId].filter(
          (msg) => msg.id !== messageId
        );
      }
    },

    setDirectMessages: (state, action: PayloadAction<DirectMessage[]>) => {
      state.directMessages = action.payload;
    },
    addDirectMessage: (state, action: PayloadAction<DirectMessage>) => {
      state.directMessages.push(action.payload);
    },
    updateDirectMessage: (state, action: PayloadAction<DirectMessage>) => {
      const index = state.directMessages.findIndex(
        (dm) => dm.id === action.payload.id
      );
      if (index !== -1) {
        state.directMessages[index] = action.payload;
      }
    },

    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    setCurrentChannel: (state, action: PayloadAction<number | null>) => {
      state.currentChannel = action.payload;
      state.currentDirectMessage = null;
    },
    setCurrentDirectMessage: (state, action: PayloadAction<number | null>) => {
      state.currentDirectMessage = action.payload;
      state.currentChannel = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Conversation messages
    setConversationMessages: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messages: ConversationMessage[];
        total: number;
        offset: number;
      }>
    ) => {
      const { conversationId, messages, total, offset } = action.payload;
      state.conversationMessages[conversationId] = messages;
      state.conversationPagination[conversationId] = {
        offset,
        total,
        hasMore: offset + messages.length < total,
      };
    },

    prependConversationMessages: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messages: ConversationMessage[];
        total: number;
        offset: number;
      }>
    ) => {
      const { conversationId, messages, total, offset } = action.payload;
      const existingMessages =
        state.conversationMessages[conversationId] || [];
      // Prepend new messages to the beginning (older messages)
      state.conversationMessages[conversationId] = [
        ...messages,
        ...existingMessages,
      ];
      state.conversationPagination[conversationId] = {
        offset,
        total,
        hasMore: offset + messages.length < total,
      };
    },

    addConversationMessage: (
      state,
      action: PayloadAction<ConversationMessage>
    ) => {
      const conversationId = action.payload.conversation_id;
      if (!state.conversationMessages[conversationId]) {
        state.conversationMessages[conversationId] = [];
      }
      // Add to the end (newest messages)
      state.conversationMessages[conversationId].push(action.payload);
    },

    setCurrentConversation: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.currentConversation = action.payload;
    },

    clearConversationMessages: (
      state,
      action: PayloadAction<number>
    ) => {
      const conversationId = action.payload;
      delete state.conversationMessages[conversationId];
      delete state.conversationPagination[conversationId];
    },

    setConversationDetails: (
      state,
      action: PayloadAction<{
        id: number;
        type: 'direct' | 'group';
        name: string | null;
        members: Array<{
          user_id: number;
          role: string;
          user: {
            id: number;
            username: string;
          };
        }>;
        created_at: string;
      }>
    ) => {
      state.conversationDetails[action.payload.id] = action.payload;
    },
  },
});

export const {
  setChannels,
  addChannel,
  updateChannel,
  deleteChannel,
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setDirectMessages,
  addDirectMessage,
  updateDirectMessage,
  setNotifications,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  setCurrentChannel,
  setCurrentDirectMessage,
  setConversationMessages,
  prependConversationMessages,
  addConversationMessage,
  setCurrentConversation,
  clearConversationMessages,
  setConversationDetails,
  setLoading,
  setError,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
