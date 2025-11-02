import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_STORAGE_KEY = '@turi_notification_enabled';
const REMINDER_TIME_STORAGE_KEY = '@turi_notification_reminder_minutes';

interface NotificationState {
  notificationsEnabled: boolean;
  reminderMinutes: number; // Minutes before task to send reminder (default: 15)
  isLoading: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setReminderMinutes: (minutes: number) => Promise<void>;
  initializeNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notificationsEnabled: false,
  reminderMinutes: 15, // Default: 15 minutes before
  isLoading: true,

  initializeNotifications: async () => {
    const currentState = get();
    // If already initialized, don't reinitialize
    if (!currentState.isLoading) {
      return;
    }
    
    try {
      const [enabledValue, reminderValue] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY),
        AsyncStorage.getItem(REMINDER_TIME_STORAGE_KEY),
      ]);
      
      // Double-check isLoading hasn't changed while we were loading
      if (!get().isLoading) {
        return;
      }
      
      if (enabledValue !== null) {
        set({ notificationsEnabled: enabledValue === 'true' });
      } else {
        set({ notificationsEnabled: false });
      }
      
      if (reminderValue !== null) {
        const minutes = parseInt(reminderValue, 10);
        if (!isNaN(minutes) && minutes > 0) {
          set({ reminderMinutes: minutes });
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      set({ isLoading: false });
    }
  },

  setNotificationsEnabled: async (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    try {
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, enabled.toString());
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  },

  setReminderMinutes: async (minutes: number) => {
    set({ reminderMinutes: minutes });
    try {
      await AsyncStorage.setItem(REMINDER_TIME_STORAGE_KEY, minutes.toString());
    } catch (error) {
      console.error('Error saving reminder time preference:', error);
    }
  },
}));

