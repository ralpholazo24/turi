import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '@/store/use-app-store';
import { useNotificationStore } from '@/store/use-notification-store';
import { useLanguageStore } from '@/store/use-language-store';
import { useThemeStore } from '@/store/use-theme-store';

// Storage keys
const STORAGE_KEYS = [
  '@turi_app_data',
  '@turi_notification_enabled',
  '@turi_notification_reminder_minutes',
  '@turi:language',
  '@turi_theme_preference',
];

/**
 * Clear all app data including:
 * - All groups, tasks, and members
 * - Notification preferences
 * - Language preference
 * - Theme preference
 * - All scheduled notifications
 */
export async function clearAllData(): Promise<void> {
  try {
    // Cancel all scheduled notifications
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
      if (notification.content.data?.type === 'task_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Clear all AsyncStorage keys
    await Promise.all(
      STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key))
    );

    // Reset all stores to their initial state
    // Directly set groups to empty array
    useAppStore.setState({ groups: [] });
    await useAppStore.getState().persist(); // Save empty state

    // Reset notification preferences
    await useNotificationStore.getState().setNotificationsEnabled(false);
    await useNotificationStore.getState().setReminderMinutes(15);

    // Reset language preference
    await useLanguageStore.getState().setLanguage('en');

    // Reset theme preference
    await useThemeStore.getState().setThemePreference('system');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

