import i18n from "@/i18n";
import { rescheduleGroupNotifications } from "@/utils/notification-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { create } from "zustand";
import { useAppStore } from "./use-app-store";
import { useNotificationStore } from "./use-notification-store";

const LANGUAGE_STORAGE_KEY = "@turi:language";

// Supported languages in the app
const SUPPORTED_LANGUAGES = ["en", "es"];

// Track ongoing initialization to prevent race conditions
let initializationPromise: Promise<void> | null = null;

interface LanguageState {
  language: string;
  isLoading: boolean;
  initializeLanguage: (force?: boolean) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "en",
  isLoading: true,

  initializeLanguage: async (force = false) => {
    // If forcing re-initialization, clear any existing promise
    if (force) {
      initializationPromise = null;
    }

    // If initialization is already in progress, wait for it to complete
    if (initializationPromise) {
      return initializationPromise;
    }

    const currentState = get();
    // If already initialized and not forcing, don't reinitialize
    if (!force && !currentState.isLoading) {
      return;
    }

    // Create a promise for this initialization to prevent concurrent calls
    initializationPromise = (async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        // Double-check isLoading hasn't changed while we were loading
        if (!get().isLoading) {
          return;
        }

        if (savedLanguage) {
          // Use saved preference (user's manual choice)
          await i18n.changeLanguage(savedLanguage);
          set({ language: savedLanguage, isLoading: false });
        } else {
          // No saved preference - detect device language
          // Get the current device locale (this will reflect the current simulator/device settings)
          const deviceLocales = Localization.getLocales();
          const deviceLocale = deviceLocales[0]?.languageCode;
          const detectedLanguage =
            deviceLocale && SUPPORTED_LANGUAGES.includes(deviceLocale)
              ? deviceLocale
              : "en"; // Fall back to English if device language is not supported

          // Update i18n immediately with detected language (before saving)
          await i18n.changeLanguage(detectedLanguage);

          // Save the detected/fallback language to AsyncStorage
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
          set({ language: detectedLanguage, isLoading: false });
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
        // Fallback to English and update i18n
        await i18n.changeLanguage("en");
        set({ language: "en", isLoading: false });
      } finally {
        // Clear the promise so future calls can initialize again if needed
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  },

  setLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      await i18n.changeLanguage(language);
      set({ language });

      // Reschedule all notifications with the new language
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled) {
        const { groups } = useAppStore.getState();
        for (const group of groups) {
          await rescheduleGroupNotifications(group, reminderMinutes);
        }
      }
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  },
}));
