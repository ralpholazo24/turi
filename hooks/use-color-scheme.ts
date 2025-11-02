import { useThemeStore } from '@/store/use-theme-store';
import { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Custom hook to manage theme preference with persistence
 * Uses Zustand store for global state management
 */
export function useColorScheme() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const isLoading = useThemeStore((state) => state.isLoading);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const systemColorScheme = useRNColorScheme();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Determine actual color scheme based on preference
  const colorScheme = themePreference === 'system' ? (systemColorScheme ?? 'light') : themePreference;

  return {
    colorScheme,
    themePreference,
    updateThemePreference: setThemePreference,
    isLoading,
  };
}
