import axiosClient, { type ApiResponse } from './http';

export interface SignupRequestPayload {
  userName: string;
  email: string;
  password: string;
}
export interface SignupResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  userName: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'private';
  createdAt: string;
  memberCount: number;
  isPrivate: boolean;
}

export interface Message {
  id: number;
  channelId: number;
  userId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  isEdited: boolean;
  reactions: Array<{
    emoji: string;
    count: number;
    users: number[];
  }>;
}

export interface DirectMessage {
  id: number;
  participants: number[];
  lastMessage: {
    id: number;
    content: string;
    timestamp: string;
    senderId: number;
  };
  unreadCount: number;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'message' | 'mention' | 'reaction';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  channelId?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface Conversation {
  id: number;
  userId: number;
  [key: string]: unknown;
}

// API Functions
export const api = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<ApiResponse<SignupResponse>>(
      `/auth/login`,
      credentials
    );

    console.log('Login response:', response);

    return {
      user: response.data.data.user,
      token: response.data.data.access_token,
      expiresIn: 3600, // 1 hour
    };
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    // Create new user
    const payload = {
      userName: credentials.userName,
      email: credentials.email,
      password: credentials.password,
    } satisfies SignupRequestPayload;

    const response = await axiosClient.post<ApiResponse<SignupResponse>>(
      `/auth/register`,
      payload
    );

    console.log('Signup response:', response.data);

    return {
      user: response.data.data.user,
      token: response.data.data.access_token,
      expiresIn: 3600,
    };
  },

  logout: async (): Promise<void> => {
    // In real app, this would invalidate the token on server
    // localStorage.removeItem('auth_token');
    // localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const response = await axiosClient.get<ApiResponse<User>>(`/users/me`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const { data } = await axiosClient.get<User[]>(`/users`);
    return data;
  },

  getUser: async (id: number): Promise<User> => {
    const { data } = await axiosClient.get<User>(`/users/${id}`);
    return data;
  },

  // Channels
  getChannels: async (): Promise<Channel[]> => {
    const { data } = await axiosClient.get<Channel[]>(`/channels`);
    return data;
  },

  getChannel: async (id: number): Promise<Channel> => {
    const { data } = await axiosClient.get<Channel>(`/channels/${id}`);
    return data;
  },

  // Messages
  getMessages: async (channelId: number): Promise<Message[]> => {
    const { data } = await axiosClient.get<Message[]>(`/messages`, {
      params: { channelId, _sort: 'timestamp', _order: 'asc' },
    });
    return data;
  },

  getMessage: async (id: number): Promise<Message> => {
    const { data } = await axiosClient.get<Message>(`/messages/${id}`);
    return data;
  },

  createMessage: async (message: Omit<Message, 'id'>): Promise<Message> => {
    const { data } = await axiosClient.post<Message>(`/messages`, message);
    return data;
  },

  updateMessage: async (
    id: number,
    updates: Partial<Message>
  ): Promise<Message> => {
    const { data } = await axiosClient.patch<Message>(
      `/messages/${id}`,
      updates
    );
    return data;
  },

  deleteMessage: async (id: number): Promise<void> => {
    await axiosClient.delete(`/messages/${id}`);
  },

  // Direct Messages
  getDirectMessages: async (): Promise<DirectMessage[]> => {
    const { data } = await axiosClient.get<DirectMessage[]>(`/directMessages`);
    return data;
  },

  getDirectMessage: async (id: number): Promise<DirectMessage> => {
    const { data } = await axiosClient.get<DirectMessage>(
      `/directMessages/${id}`
    );
    return data;
  },

  // Notifications
  getNotifications: async (userId: number): Promise<Notification[]> => {
    const { data } = await axiosClient.get<Notification[]>(`/notifications`, {
      params: { userId, _sort: 'timestamp', _order: 'desc' },
    });
    return data;
  },

  markNotificationAsRead: async (id: number): Promise<Notification> => {
    const { data } = await axiosClient.patch<Notification>(
      `/notifications/${id}`,
      { isRead: true }
    );
    return data;
  },

  // Settings
  getSettings: async (userId: number): Promise<unknown> => {
    const { data } = await axiosClient.get<unknown[]>(`/settings`, {
      params: { userId },
    });
    return (data as unknown[])[0] || null;
  },

  updateSettings: async (
    userId: number,
    settings: Record<string, unknown>
  ): Promise<unknown> => {
    const { data } = await axiosClient.post<unknown>(`/settings`, {
      userId,
      ...settings,
    });
    return data;
  },
  getConversationsOfUser: async (userId: number): Promise<Conversation[]> => {
    const [{ data: conversations }, { data: friends }]: [
      { data: Conversation[] },
      { data: Array<{ friendId: number; conversationId: number }> }
    ] = await Promise.all([
      axiosClient.get<Conversation[]>(`/conversations`, { params: { userId } }),
      axiosClient.get(`/friends`, { params: { userId } }),
    ]);

    return conversations.map((conversation) => ({
      ...conversation,
      friends: (
        friends as Array<{ friendId: number; conversationId: number }>
      ).filter((f) => f.conversationId === conversation.id),
    }));
  },
};

export default api;
