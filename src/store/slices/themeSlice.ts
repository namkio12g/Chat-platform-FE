import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' ;

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'dark'].includes(saved)) {
      return saved;
    }
  }
  return 'light';
};

const getResolvedTheme = (theme: Theme): 'light' | 'dark' => {
  return theme;
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  resolvedTheme: getResolvedTheme(getInitialTheme()),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolvedTheme = getResolvedTheme(action.payload);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
      
      // Apply theme to document
      const resolvedTheme = getResolvedTheme(action.payload);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolvedTheme);
    },
    updateResolvedTheme: (state) => {
      state.resolvedTheme = getResolvedTheme(state.theme);
    },
  },
});

export const { setTheme, updateResolvedTheme } = themeSlice.actions;
export default themeSlice.reducer;
