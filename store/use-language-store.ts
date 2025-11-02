import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import i18n from '@/i18n';
import { useAppStore } from './use-app-store';
import { useNotificationStore } from './use-notification-store';
import { rescheduleGroupNotifications } from '@/utils/notification-service';

const LANGUAGE_STORAGE_KEY = '@turi:language';

interface LanguageState {
  language: string;
  isLoading: boolean;
  initializeLanguage: () => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  isLoading: true,

  initializeLanguage: async () => {
    const currentState = get();
    // If already initialized, don't reinitialize
    if (!currentState.isLoading) {
      return;
    }

    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      // Double-check isLoading hasn't changed while we were loading
      if (!get().isLoading) {
        return;
      }

      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
        set({ language: savedLanguage, isLoading: false });
      } else {
        set({ language: 'en', isLoading: false });
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      set({ language: 'en', isLoading: false });
    }
  },

  setLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      await i18n.changeLanguage(language);
      set({ language });
      
      // Reschedule all notifications with the new language
      const { notificationsEnabled, reminderMinutes } = useNotificationStore.getState();
      if (notificationsEnabled) {
        const { groups } = useAppStore.getState();
        for (const group of groups) {
          await rescheduleGroupNotifications(group, reminderMinutes);
        }
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  },
}));

