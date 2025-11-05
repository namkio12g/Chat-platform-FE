import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import Dashboard from '@/pages/Dashboard/index';
import App from '@/App';
import { ProtectedRoute } from '@/context/ProtectedRoute';

export const router = createBrowserRouter([
  // {
  //   path: '/',
  //   element: <Home />,
  // },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
  {
    path: '/app',
    element: <App />,
  },
]);
