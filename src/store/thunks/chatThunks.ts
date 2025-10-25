import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import type { Message } from '@/services/api';

// Fetch channels
export const fetchChannels = createAsyncThunk(
  'chat/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const channels = await api.getChannels();
      return channels;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch channels'
      );
    }
  }
);

// Fetch messages for a channel
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (channelId: number, { rejectWithValue }) => {
    try {
      const messages = await api.getMessages(channelId);
      return { channelId, messages };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch messages'
      );
    }
  }
);

// Send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: Omit<Message, 'id'>, { rejectWithValue }) => {
    try {
      const message = await api.createMessage(messageData);
      return message;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    }
  }
);

// Update a message
export const updateMessage = createAsyncThunk(
  'chat/updateMessage',
  async (
    { id, updates }: { id: number; updates: Partial<Message> },
    { rejectWithValue }
  ) => {
    try {
      const message = await api.updateMessage(id, updates);
      return message;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update message'
      );
    }
  }
);

// Delete a message
export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: number, { rejectWithValue }) => {
    try {
      await api.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete message'
      );
    }
  }
);

// Fetch direct messages
export const fetchDirectMessages = createAsyncThunk(
  'chat/fetchDirectMessages',
  async (_, { rejectWithValue }) => {
    try {
      const directMessages = await api.getDirectMessages();
      return directMessages;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to fetch direct messages'
      );
    }
  }
);

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'chat/fetchNotifications',
  async (userId: number, { rejectWithValue }) => {
    try {
      const notifications = await api.getNotifications(userId);
      return notifications;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch notifications'
      );
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'chat/markNotificationAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const notification = await api.markNotificationAsRead(notificationId);
      return notification;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to mark notification as read'
      );
    }
  }
);
