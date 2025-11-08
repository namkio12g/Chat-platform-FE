import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    theme: themeReducer,
    auth: authReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
