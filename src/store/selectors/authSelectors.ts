import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Basic selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Computed selectors
export const selectUserDisplayName = createSelector(
  [selectUser],
  (user) => user?.name || 'Unknown User'
);

export const selectUserAvatar = createSelector(
  [selectUser],
  (user) => user?.avatar || ''
);

export const selectUserStatus = createSelector(
  [selectUser],
  (user) => user?.status || 'offline'
);

export const selectIsLoggedIn = createSelector(
  [selectIsAuthenticated, selectToken],
  (isAuthenticated, token) => isAuthenticated && !!token
);
