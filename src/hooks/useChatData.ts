import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  User,
  Channel,
  Message,
  DirectMessage,
  Notification,
  LoginCredentials,
  AuthResponse,
} from '@/services/api';

// Authentication
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.login,
    onSuccess: (authResponse) => {
      // Store auth data in localStorage
      localStorage.setItem('auth_token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      // Invalidate and refetch user data
      queryClient.invalidateQueries({
        queryKey: ['currentUser'],
      });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: api.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
};

// Channels
export const useChannels = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: api.getChannels,
  });
};

export const useChannel = (id: number) => {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => api.getChannel(id),
    enabled: !!id,
  });
};

// Messages
export const useMessages = (channelId: number) => {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: () => api.getMessages(channelId),
    enabled: !!channelId,
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMessage,
    onSuccess: (newMessage) => {
      // Invalidate and refetch messages for the channel
      queryClient.invalidateQueries({
        queryKey: ['messages', newMessage.channelId],
      });
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Message> }) =>
      api.updateMessage(id, updates),
    onSuccess: (updatedMessage) => {
      // Invalidate and refetch messages for the channel
      queryClient.invalidateQueries({
        queryKey: ['messages', updatedMessage.channelId],
      });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMessage,
    onSuccess: (_, messageId) => {
      // Invalidate all messages queries
      queryClient.invalidateQueries({
        queryKey: ['messages'],
      });
    },
  });
};

// Direct Messages
export const useDirectMessages = () => {
  return useQuery({
    queryKey: ['directMessages'],
    queryFn: api.getDirectMessages,
  });
};

export const useDirectMessage = (id: number) => {
  return useQuery({
    queryKey: ['directMessage', id],
    queryFn: () => api.getDirectMessage(id),
    enabled: !!id,
  });
};

// Notifications
export const useNotifications = (userId: number) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => api.getNotifications(userId),
    enabled: !!userId,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.markNotificationAsRead,
    onSuccess: (updatedNotification) => {
      // Invalidate notifications for the user
      queryClient.invalidateQueries({
        queryKey: ['notifications', updatedNotification.userId],
      });
    },
  });
};

// Settings
export const useSettings = (userId: number) => {
  return useQuery({
    queryKey: ['settings', userId],
    queryFn: () => api.getSettings(userId),
    enabled: !!userId,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, settings }: { userId: number; settings: any }) =>
      api.updateSettings(userId, settings),
    onSuccess: (_, { userId }) => {
      // Invalidate settings for the user
      queryClient.invalidateQueries({
        queryKey: ['settings', userId],
      });
    },
  });
};
