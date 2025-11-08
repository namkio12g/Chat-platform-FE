import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectToken, selectUser } from '@/store/selectors/authSelectors';
import { toast } from 'sonner';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();

  useAuthInitialization();

  useEffect(() => {
    console.log(token, user);
    console.log(location.pathname);
    if (!(token && user) && !location.pathname.includes('/login')) {
      toast.error('You must be logged in to access this page');
      navigate('/login');
    }
  }, [token, user, location.pathname, navigate, useAuthInitialization]);

  if (!(token && user) && !location.pathname.includes('/login')) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};
