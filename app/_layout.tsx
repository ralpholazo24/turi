import '@/i18n'; // Initialize i18n
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PostHogProvider } from 'posthog-react-native';
import 'react-native-reanimated';

import { CustomSplashScreen } from '@/components/splash-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/use-app-store';
import { useLanguageStore } from '@/store/use-language-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useUserStore } from '@/store/use-user-store';
import { posthog } from '@/utils/posthog';
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
  const initializeUser = useUserStore((state) => state.initialize);
  const initializeApp = useAppStore((state) => state.initialize);
  const { onboardingCompleted, isLoading: userLoading } = useUserStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      const startTime = Date.now();
      const MIN_SPLASH_DURATION = 1500; // Minimum 1.5 seconds for smooth transition

      try {
        // Initialize theme FIRST to ensure colors are ready for CustomSplashScreen
        await initializeTheme();
        
        // Wait a small amount to ensure theme state is propagated
        await new Promise((resolve) => setTimeout(resolve, 50));
        
        // Initialize other stores in parallel (theme is already done)
        await Promise.all([
          initializeLanguage(),
          initializeUser(),
          initializeApp(),
        ]);
        
        // Ensure native splash screen shows for at least MIN_SPLASH_DURATION
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }
        
        // Now hide native splash screen - CustomSplashScreen can render with proper colors
        // This happens after minimum duration is enforced
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          // Ignore errors - this can happen in some edge cases
          if (__DEV__) {
            console.warn('Splash screen hide error (can be ignored):', error);
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, [initializeTheme, initializeLanguage, initializeUser, initializeApp]);

  // Navigate to onboarding if needed after user store is initialized
  useEffect(() => {
    if (!userLoading && isReady && !onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [userLoading, isReady, onboardingCompleted]);

  // Handle notification taps - navigate to task details
  useEffect(() => {
    if (!isReady) {
      return;
    }

    // Helper function to handle notification navigation with error handling
    // Defined inside effect to access latest appLoading and groups via closure
    // without causing the effect to re-run when they change
    const handleNotificationNavigation = async (
      groupId: string,
      taskId: string,
      isInitialNotification: boolean = false
    ) => {
      try {
        // Get latest values from store (will be current when function is called)
        const currentGroups = useAppStore.getState().groups;

        // Wait for app store to finish loading
        let retries = 0;
        const maxRetries = 20; // Wait up to 2 seconds (20 * 100ms)
        while (retries < maxRetries) {
          const currentState = useAppStore.getState();
          if (!currentState.isLoading) break;
          
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }

        // Verify group and task exist before navigating
        const latestGroups = useAppStore.getState().groups;
        const group = latestGroups.find((g) => g.id === groupId);
        if (!group) {
          console.warn(`Group ${groupId} not found when handling notification`);
          return;
        }

        const task = group.tasks.find((t) => t.id === taskId);
        if (!task) {
          console.warn(`Task ${taskId} not found in group ${groupId} when handling notification`);
          return;
        }

        // Add a small delay to ensure router is fully initialized
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Navigate to task details screen
        const route = `/group/${groupId}/task/${taskId}` as const;
        if (isInitialNotification) {
          // Use replace for initial notification (when app was closed)
          router.replace(route as any);
        } else {
          // Use push for notifications when app is running
          router.push(route as any);
        }
      } catch (error) {
        console.error('Error navigating to task from notification:', error);
        // Don't crash the app, just log the error
      }
    };

    // Check if app was opened from a notification (when app was closed)
    const checkInitialNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) {
          const data = response.notification.request.content.data;
          
          // Check if this is a task reminder notification
          if (data?.type === 'task_reminder' && data?.taskId && data?.groupId) {
            // Ensure taskId and groupId are strings
            const groupId = String(data.groupId);
            const taskId = String(data.taskId);
            
            // Wait for app store to finish loading before navigating
            await handleNotificationNavigation(
              groupId,
              taskId,
              true // isInitialNotification = true
            );
          }
        }
      } catch (error) {
        console.error('Error checking initial notification:', error);
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
        try {
          const data = response.notification.request.content.data;
          
          // Check if this is a task reminder notification
          if (data?.type === 'task_reminder' && data?.taskId && data?.groupId) {
            // Ensure taskId and groupId are strings
            const groupId = String(data.groupId);
            const taskId = String(data.taskId);
            
            // Navigate to task details screen
            handleNotificationNavigation(
              groupId,
              taskId,
              false // isInitialNotification = false
            );
          }
        } catch (error) {
          console.error('Error handling notification response:', error);
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
      {posthog ? (
        <PostHogProvider client={posthog}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
                animationDuration: 250,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}>
              <Stack.Screen name="onboarding" />
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
        </PostHogProvider>
      ) : (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
              animationDuration: 250,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}>
            <Stack.Screen name="onboarding" />
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
      )}
    </GestureHandlerRootView>
  );
}
