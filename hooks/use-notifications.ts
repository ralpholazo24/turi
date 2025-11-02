import { useNotificationStore } from '@/store/use-notification-store';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

/**
 * Custom hook to manage notification preferences and permissions
 */
export function useNotifications() {
  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const reminderMinutes = useNotificationStore((state) => state.reminderMinutes);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const setNotificationsEnabled = useNotificationStore((state) => state.setNotificationsEnabled);
  const setReminderMinutes = useNotificationStore((state) => state.setReminderMinutes);
  const initializeNotifications = useNotificationStore((state) => state.initializeNotifications);
  
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  useEffect(() => {
    initializeNotifications();
    checkPermissions();
  }, [initializeNotifications]);

  const checkPermissions = async () => {
    setIsCheckingPermission(true);
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        // Configure notification handler
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      // If enabling, check/request permissions first
      const hasPermission = permissionStatus === 'granted' || await requestPermissions();
      if (hasPermission) {
        await setNotificationsEnabled(true);
      } else {
        // Permission denied, don't enable
        await setNotificationsEnabled(false);
      }
    } else {
      // If disabling, just update preference
      await setNotificationsEnabled(false);
    }
  };

  return {
    notificationsEnabled,
    reminderMinutes,
    isLoading,
    permissionStatus,
    isCheckingPermission,
    toggleNotifications,
    setReminderMinutes,
    requestPermissions,
    checkPermissions,
  };
}

