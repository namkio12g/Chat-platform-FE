const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  bio: string;
  joinedAt: string;
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

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// API Functions
export const api = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API call - in real app, this would be a POST to /auth/login
    const response = await fetch(
      `${API_BASE_URL}/users?email=${credentials.email}`
    );
    const users = await response.json();

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Simulate password check (in real app, this would be done on server)
    if (credentials.password !== 'password123') {
      throw new Error('Invalid password');
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;

    return {
      user,
      token,
      expiresIn: 3600, // 1 hour
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
      const response = await fetch(`${API_BASE_URL}/users/1`); // Mock current user
      return await response.json();
    } catch {
      return null;
    }
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.json();
  },

  getUser: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return response.json();
  },

  // Channels
  getChannels: async (): Promise<Channel[]> => {
    const response = await fetch(`${API_BASE_URL}/channels`);
    return response.json();
  },

  getChannel: async (id: number): Promise<Channel> => {
    const response = await fetch(`${API_BASE_URL}/channels/${id}`);
    return response.json();
  },

  // Messages
  getMessages: async (channelId: number): Promise<Message[]> => {
    const response = await fetch(
      `${API_BASE_URL}/messages?channelId=${channelId}&_sort=timestamp&_order=asc`
    );
    return response.json();
  },

  getMessage: async (id: number): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`);
    return response.json();
  },

  createMessage: async (message: Omit<Message, 'id'>): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    return response.json();
  },

  updateMessage: async (
    id: number,
    updates: Partial<Message>
  ): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  deleteMessage: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE',
    });
  },

  // Direct Messages
  getDirectMessages: async (): Promise<DirectMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/directMessages`);
    return response.json();
  },

  getDirectMessage: async (id: number): Promise<DirectMessage> => {
    const response = await fetch(`${API_BASE_URL}/directMessages/${id}`);
    return response.json();
  },

  // Notifications
  getNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await fetch(
      `${API_BASE_URL}/notifications?userId=${userId}&_sort=timestamp&_order=desc`
    );
    return response.json();
  },

  markNotificationAsRead: async (id: number): Promise<Notification> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead: true }),
    });
    return response.json();
  },

  // Settings
  getSettings: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/settings?userId=${userId}`);
    const settings = await response.json();
    return settings[0] || null;
  },

  updateSettings: async (userId: number, settings: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...settings }),
    });
    return response.json();
  },
};

export default api;
