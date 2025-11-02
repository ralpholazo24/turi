import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@turi_theme_preference';

interface ThemeState {
  themePreference: 'light' | 'dark' | 'system';
  isLoading: boolean;
  setThemePreference: (preference: 'light' | 'dark' | 'system') => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themePreference: 'system',
  isLoading: true,

  initializeTheme: async () => {
    try {
      const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (value === 'light' || value === 'dark' || value === 'system') {
        set({ themePreference: value, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      set({ isLoading: false });
    }
  },

  setThemePreference: async (preference: 'light' | 'dark' | 'system') => {
    set({ themePreference: preference });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  },
}));

