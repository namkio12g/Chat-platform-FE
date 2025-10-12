import { createBrowserRouter, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/login';
import Dashboard from '@/pages/Dashboard/index';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
]);
