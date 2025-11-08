import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/thunks/authThunks';

export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if there's stored auth data on app startup
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      dispatch(initializeAuth());
    }
  }, [dispatch]);
};


