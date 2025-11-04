import { User } from "@/types";
import { getRandomAvatarColor } from "@/utils/member-avatar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const USER_STORAGE_KEY = "@turi_user";
const ONBOARDING_STORAGE_KEY = "@turi_onboarding_completed";

interface UserState {
  user: User | null;
  onboardingCompleted: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  setUser: (name: string, avatarColor?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  clearUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  onboardingCompleted: false,
  isLoading: true,

  initialize: async () => {
    try {
      const [userJson, onboardingJson] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
      ]);

      const user = userJson ? (JSON.parse(userJson) as User) : null;
      const onboardingCompleted = onboardingJson === "true";

      set({
        user,
        onboardingCompleted,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error initializing user store:", error);
      set({
        user: null,
        onboardingCompleted: false,
        isLoading: false,
      });
    }
  },

  setUser: async (name: string, avatarColor?: string) => {
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      avatarColor: avatarColor || getRandomAvatarColor(),
    };

    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      set({ user: newUser });
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      set({ onboardingCompleted: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "false");
      set({ onboardingCompleted: false });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      throw error;
    }
  },

  clearUser: async () => {
    try {
      await AsyncStorage.multiRemove([
        USER_STORAGE_KEY,
        ONBOARDING_STORAGE_KEY,
      ]);
      set({
        user: null,
        onboardingCompleted: false,
      });
    } catch (error) {
      console.error("Error clearing user:", error);
      throw error;
    }
  },
}));
