import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '@/i18n'; // Initialize i18n

import { CustomSplashScreen } from '@/components/splash-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/store/use-theme-store';
import { useLanguageStore } from '@/store/use-language-store';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const initializeLanguage = useLanguageStore((state) => state.initializeLanguage);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize theme and language
        await Promise.all([
          initializeTheme(),
          initializeLanguage(),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, [initializeTheme, initializeLanguage]);

  // Hide the native splash screen once React is ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return <CustomSplashScreen />;
  }

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
