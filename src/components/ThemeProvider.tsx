import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme, updateResolvedTheme } from '@/store/slices/themeSlice';
import { ThemeToggle } from './ThemeToggle';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const { theme, resolvedTheme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'  | null;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      dispatch(setTheme(savedTheme));
    } 
  }, [dispatch]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'light') {
        dispatch(updateResolvedTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch, theme]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return <>
  <div className='relative'>
  <div className='ml-auto fixed top-4 right-4 '>
    <ThemeToggle />
  </div>

  {children}
  </div>
  </>;
}
