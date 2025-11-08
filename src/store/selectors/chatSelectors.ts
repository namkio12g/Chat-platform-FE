import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Basic selectors
export const selectChat = (state: RootState) => state.chat;
export const selectChannels = (state: RootState) => state.chat.channels;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectDirectMessages = (state: RootState) =>
  state.chat.directMessages;

// Conversation selectors
export const selectCurrentConversation = (state: RootState) =>
  state.chat.currentConversation;
export const selectConversationMessages = (state: RootState) =>
  state.chat.conversationMessages;
export const selectConversationPagination = (state: RootState) =>
  state.chat.conversationPagination;
export const selectConversationDetails = (state: RootState) =>
  state.chat.conversationDetails;

// Select messages for a specific conversation
export const selectMessagesByConversationId = (conversationId: number) =>
  createSelector(
    [selectConversationMessages],
    (messages) => messages[conversationId] || []
  );

// Select pagination for a specific conversation
export const selectPaginationByConversationId = (conversationId: number) =>
  createSelector(
    [selectConversationPagination],
    (pagination) =>
      pagination[conversationId] || { offset: 0, total: 0, hasMore: false }
  );
export const selectNotifications = (state: RootState) =>
  state.chat.notifications;
export const selectCurrentChannel = (state: RootState) =>
  state.chat.currentChannel;
export const selectCurrentDirectMessage = (state: RootState) =>
  state.chat.currentDirectMessage;
export const selectChatLoading = (state: RootState) => state.chat.isLoading;
export const selectChatError = (state: RootState) => state.chat.error;

// Computed selectors
export const selectCurrentChannelMessages = createSelector(
  [selectMessages, selectCurrentChannel],
  (messages, currentChannel) => {
    if (!currentChannel) return [];
    return messages[currentChannel] || [];
  }
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) =>
    notifications.filter((notification) => !notification.isRead)
);

export const selectUnreadNotificationCount = createSelector(
  [selectUnreadNotifications],
  (unreadNotifications) => unreadNotifications.length
);

export const selectChannelById = createSelector(
  [selectChannels, (state: RootState, channelId: number) => channelId],
  (channels, channelId) => channels.find((channel) => channel.id === channelId)
);

export const selectDirectMessageById = createSelector(
  [selectDirectMessages, (state: RootState, dmId: number) => dmId],
  (directMessages, dmId) => directMessages.find((dm) => dm.id === dmId)
);

export const selectPublicChannels = createSelector(
  [selectChannels],
  (channels) => channels.filter((channel) => channel.type === 'public')
);

export const selectPrivateChannels = createSelector(
  [selectChannels],
  (channels) => channels.filter((channel) => channel.type === 'private')
);
