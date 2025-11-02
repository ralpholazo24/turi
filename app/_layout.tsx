import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '@/i18n'; // Initialize i18n

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/store/use-theme-store';
import { useLanguageStore } from '@/store/use-language-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const initializeLanguage = useLanguageStore((state) => state.initializeLanguage);

  useEffect(() => {
    initializeTheme();
    initializeLanguage();
  }, [initializeTheme, initializeLanguage]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="activity" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="about" />
          <Stack.Screen name="feature-requests" />
          <Stack.Screen name="help" />
          <Stack.Screen name="language" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
