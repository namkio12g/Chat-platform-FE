import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import type { LoginCredentials, SignupCredentials, User } from '@/services/api';

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }
);

// Signup thunk
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const response = await api.signup(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Signup failed'
      );
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.logout();
      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to logout'
      );
      return false;
    }
  }
);

// Get current user thunk
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await api.getCurrentUser();
      if (!user) {
        throw new Error('No user found');
      }
      return user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get user'
      );
    }
  }
);

// Initialize auth from localStorage
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        return { user, token };
      } catch {
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        throw new Error('Invalid stored auth data');
      }
    }

    throw new Error('No stored auth data');
  }
);
