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
  refresh_token: string;
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
      refresh_token: response.data.data.refresh_token,
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
      refresh_token: response.data.data.refresh_token,
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
  // GET /api/v1/notifications?limit=20&offset=0
  getNotifications: async (
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    notifications: Array<{
      id: number;
      user_id: number;
      type: string;
      title: string;
      message: string;
      data: string;
      status: 'unread' | 'read';
      conversation_id?: number;
      message_id?: number;
      created_at: string;
      updated_at: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await axiosClient.get<
      ApiResponse<{
        notifications: Array<{
          id: number;
          user_id: number;
          type: string;
          title: string;
          message: string;
          data: string;
          status: 'unread' | 'read';
          conversation_id?: number;
          message_id?: number;
          created_at: string;
          updated_at: string;
        }>;
        total: number;
        limit: number;
        offset: number;
      }>
    >(`/notifications`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  // GET /api/v1/notifications/unread
  getUnreadNotifications: async (): Promise<{
    notifications: Array<{
      id: number;
      user_id: number;
      type: string;
      title: string;
      message: string;
      status: 'unread' | 'read';
      conversation_id?: number;
      message_id?: number;
      created_at: string;
    }>;
    count: number;
  }> => {
    const response = await axiosClient.get<
      ApiResponse<{
        notifications: Array<{
          id: number;
          user_id: number;
          type: string;
          title: string;
          message: string;
          status: 'unread' | 'read';
          conversation_id?: number;
          message_id?: number;
          created_at: string;
        }>;
        count: number;
      }>
    >(`/notifications/unread`);
    return response.data.data;
  },

  // PATCH /api/v1/notifications/:id/read
  markNotificationAsRead: async (notificationId: number): Promise<{
    message: string;
  }> => {
    const response = await axiosClient.patch<ApiResponse<{ message: string }>>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  },

  // PATCH /api/v1/notifications/read-all
  markAllNotificationsAsRead: async (): Promise<{
    message: string;
  }> => {
    const response = await axiosClient.patch<ApiResponse<{ message: string }>>(
      `/notifications/read-all`
    );
    return response.data.data;
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

  // Get all conversations for the logged-in user
  // Based on API Integration Guide section 3.3
  // GET /api/v1/conversations?limit=20&offset=0
  getConversations: async (limit: number = 20, offset: number = 0) => {
    const response = await axiosClient.get<
      ApiResponse<{
        conversations: Array<{
          id: number;
          type: 'direct' | 'group';
          name: string | null;
          members: Array<{
            user_id: number;
            role: string;
            user: {
              id: number;
              username: string;
              avatar_url: string;
            };
          }>;
          created_at: string;
        }>;
        total: number;
      }>
    >(`/conversations`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  // Get a specific conversation by ID
  // Based on API Integration Guide section 3.4
  // GET /api/v1/conversations/{id}
  getConversation: async (conversationId: number) => {
    const response = await axiosClient.get<
      ApiResponse<{
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
    >(`/conversations/${conversationId}`);
    return response.data.data;
  },

  // Search users - Based on API Integration Guide section 7.2
  searchUsers: async (
    query: string,
    limit: number = 20,
    offset: number = 0
  ) => {
    const response = await axiosClient.get<
      ApiResponse<{
        users: Array<{ id: number; username: string; email: string }>;
      }>
    >(`/search/users`, {
      params: { q: query, limit, offset },
    });
    return response.data.data;
  },

  // Create direct conversation - Based on API Integration Guide section 3.1
  // Note: Backend expects recipient_id field name (lowercase with underscore)
  createDirectConversation: async (recipientId: number) => {
    // Validate recipientId
    if (!recipientId || recipientId <= 0) {
      throw new Error('Invalid recipient ID');
    }

    // Prepare request body with exact field name expected by Go backend
    const requestBody = {
      recipient_id: recipientId,
    };

    const response = await axiosClient.post<
      ApiResponse<{
        id: number;
        type: string;
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
    >(`/conversations/direct`, requestBody);

    return response.data.data;
  },

  // Get messages for a conversation - Based on API Integration Guide section 4.2
  // GET /api/v1/conversations/{id}/messages?limit=50&offset=0
  getConversationMessages: async (
    conversationId: number,
    limit: number = 10,
    offset: number = 0
  ) => {
    const response = await axiosClient.get<
      ApiResponse<{
        messages: Array<{
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
        }>;
        total: number;
      }>
    >(`/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  // Media upload
  uploadMedia: async (
    file: File
  ): Promise<{
    media_id: number;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<
      ApiResponse<{
        media_id: number;
        url: string;
        filename: string;
        mime_type: string;
        size: number;
      }>
    >(`/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Upload/Update Avatar
  // POST /api/v1/users/profile/avatar
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosClient.post<
      ApiResponse<{
        id: number;
        email: string;
        username: string;
        avatar_url: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>
    >(`/users/profile/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Map API response to User interface
    const apiUser = response.data.data;
    return {
      id: apiUser.id,
      userName: apiUser.username,
      email: apiUser.email,
      avatar: apiUser.avatar_url,
      status: 'online' as const,
      isActive: apiUser.is_active,
      createdAt: apiUser.created_at,
      updatedAt: apiUser.updated_at,
    };
  },

  // Update Profile (name/username)
  // PATCH /api/v1/users/profile
  updateProfile: async (username: string): Promise<User> => {
    const response = await axiosClient.patch<
      ApiResponse<{
        id: number;
        email: string;
        username: string;
        avatar_url?: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>
    >(`/users/profile`, {
      username,
    });

    // Map API response to User interface
    const apiUser = response.data.data;
    return {
      id: apiUser.id,
      userName: apiUser.username,
      email: apiUser.email,
      avatar: apiUser.avatar_url || '',
      status: 'online' as const,
      isActive: apiUser.is_active,
      createdAt: apiUser.created_at,
      updatedAt: apiUser.updated_at,
    };
  },
};

export default api;
