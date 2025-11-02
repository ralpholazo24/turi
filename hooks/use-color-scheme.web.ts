import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeStore } from '@/store/use-theme-store';

/**
 * Custom hook to manage theme preference with persistence (Web version)
 * Uses Zustand store for global state management
 */
export function useColorScheme() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const isLoading = useThemeStore((state) => state.isLoading);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const systemColorScheme = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    initializeTheme();
  }, [initializeTheme]);

  // Determine actual color scheme based on preference
  const colorScheme = themePreference === 'system' ? (systemColorScheme ?? 'light') : themePreference;

  if (!hasHydrated) {
    return {
      colorScheme: 'light',
      themePreference: 'system',
      updateThemePreference: setThemePreference,
      isLoading: true,
    };
  }

  return {
    colorScheme,
    themePreference,
    updateThemePreference: setThemePreference,
    isLoading,
  };
}
