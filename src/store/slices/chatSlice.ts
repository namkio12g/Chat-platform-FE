import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Channel,
  Message,
  DirectMessage,
  Notification,
} from '@/services/api';

interface ChatState {
  channels: Channel[];
  messages: { [channelId: number]: Message[] };
  directMessages: DirectMessage[];
  notifications: Notification[];
  currentChannel: number | null;
  currentDirectMessage: number | null;
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
  setLoading,
  setError,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
