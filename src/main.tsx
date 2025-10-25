import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { ThemeProvider } from './components/ThemeProvider';
import './index.css';
import { Toaster } from 'sonner';

useAuthInitialization();
x;
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
