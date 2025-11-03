import '@/i18n'; // Initialize i18n
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { CustomSplashScreen } from '@/components/splash-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguageStore } from '@/store/use-language-store';
import { useThemeStore } from '@/store/use-theme-store';
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
      const startTime = Date.now();
      const MIN_SPLASH_DURATION = 3000; // Minimum 3 seconds

      try {
        // Initialize theme and language
        await Promise.all([
          initializeTheme(),
          initializeLanguage(),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Ensure splash screen shows for at least MIN_SPLASH_DURATION
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }
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

  // Handle notification taps - navigate to task details
  useEffect(() => {
    if (!isReady) {
      return;
    }

    // Check if app was opened from a notification (when app was closed)
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const data = response.notification.request.content.data;
        
        // Check if this is a task reminder notification
        if (data?.type === 'task_reminder' && data?.taskId && data?.groupId) {
          // Navigate to task details screen
          router.push(`/group/${data.groupId}/task/${data.taskId}`);
        }
      }
    };

    // Check initial notification after app is ready
    checkInitialNotification();

    // Handle notification received while app is in foreground
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        // You can handle foreground notifications here if needed
        console.log('Notification received:', notification);
      }
    );

    // Handle notification tap/interaction (when app is running)
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        // Check if this is a task reminder notification
        if (data?.type === 'task_reminder' && data?.taskId && data?.groupId) {
          // Navigate to task details screen
          router.push(`/group/${data.groupId}/task/${data.taskId}`);
        }
      }
    );

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
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
