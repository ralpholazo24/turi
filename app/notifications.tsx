import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNotifications } from '@/hooks/use-notifications';
import { useAppStore } from '@/store/use-app-store';
import { rescheduleGroupNotifications } from '@/utils/notification-service';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

export default function NotificationsSettingsScreen() {
  const { groups } = useAppStore();
  const {
    notificationsEnabled,
    reminderMinutes,
    permissionStatus,
    toggleNotifications,
    setReminderMinutes,
  } = useNotifications();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

  const BackIcon = APP_ICONS.back;
  const BellIcon = LucideIcons.Bell;
  const [wasTryingToEnable, setWasTryingToEnable] = useState(false);

  // Watch for permission status changes and show alert if needed
  useEffect(() => {
    if (wasTryingToEnable && permissionStatus === 'denied' && !notificationsEnabled) {
      // Permission was denied when trying to enable notifications
      Alert.alert(
        'Permission Required',
        'To enable notifications, please grant permission in your device settings.',
        [{ text: 'OK' }]
      );
      setWasTryingToEnable(false);
    }
  }, [permissionStatus, notificationsEnabled, wasTryingToEnable]);

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !notificationsEnabled) {
      setWasTryingToEnable(true);
    }
    await toggleNotifications(value);
  };

  const formatReminderTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
  };

  const handleReminderTimePress = () => {
    const options = [
      { label: '5 minutes', value: 5 },
      { label: '10 minutes', value: 10 },
      { label: '15 minutes', value: 15 },
      { label: '30 minutes', value: 30 },
      { label: '1 hour', value: 60 },
      { label: '2 hours', value: 120 },
      { label: 'Cancel', value: -1 },
    ];

    Alert.alert(
      'Reminder Time',
      'Get notified before your task is due',
      options.map((option) => ({
        text: option.label,
        style: option.value === -1 ? 'cancel' : 'default',
        onPress: async () => {
          if (option.value !== -1) {
            await setReminderMinutes(option.value);
            
            // Reschedule all notifications with new reminder time
            if (notificationsEnabled) {
              for (const group of groups) {
                await rescheduleGroupNotifications(group, option.value);
              }
            }
          }
        },
      })),
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Notifications
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Info Section */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: borderColor + '15', borderColor: borderColor + '30' }]}>
            <BellIcon size={24} color={iconColor} style={styles.infoIcon} />
            <ThemedText style={styles.infoTitle}>Task Reminders</ThemedText>
            <ThemedText style={styles.infoText}>
              Get notified before your tasks are due. Notifications are sent based on your reminder time setting.
            </ThemedText>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>
          
          <View style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <BellIcon size={20} color="#10B981" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingText}>Enable Notifications</ThemedText>
                {permissionStatus === 'denied' && (
                  <ThemedText style={styles.settingSubtext}>
                    Permission required in device settings
                  </ThemedText>
                )}
                {permissionStatus === 'granted' && notificationsEnabled && (
                  <ThemedText style={styles.settingSubtext}>
                    You'll receive reminders before tasks are due
                  </ThemedText>
                )}
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          {notificationsEnabled && (
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleReminderTimePress}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                  <BellIcon size={20} color="#10B981" />
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingText}>Remind Me Before</ThemedText>
                  <ThemedText style={styles.settingSubtext}>
                    Get notified before your task is due
                  </ThemedText>
                </View>
              </View>
              <View style={styles.settingRight}>
                <ThemedText style={styles.settingValue}>
                  {formatReminderTime(reminderMinutes)}
                </ThemedText>
                <LucideIcons.ChevronRight size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* How It Works */}
        {notificationsEnabled && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>HOW IT WORKS</ThemedText>
            
            <View style={styles.howItWorksContainer}>
              <View style={styles.howItWorksItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#10B981' + '20' }]}>
                  <ThemedText style={[styles.stepNumberText, { color: '#10B981' }]}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Tasks are scheduled</ThemedText>
                  <ThemedText style={styles.stepDescription}>
                    When you create or update tasks with schedules, notifications are automatically scheduled.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#10B981' + '20' }]}>
                  <ThemedText style={[styles.stepNumberText, { color: '#10B981' }]}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>You get reminders</ThemedText>
                  <ThemedText style={styles.stepDescription}>
                    You'll receive a notification {formatReminderTime(reminderMinutes).toLowerCase()} before each task is due.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#10B981' + '20' }]}>
                  <ThemedText style={[styles.stepNumberText, { color: '#10B981' }]}>3</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Notifications update automatically</ThemedText>
                  <ThemedText style={styles.stepDescription}>
                    When tasks are completed or updated, notifications are automatically rescheduled for the next occurrence.
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    opacity: 0.6,
  },
  infoCard: {
    padding: 16,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    opacity: 0.6,
  },
  howItWorksContainer: {
    gap: 20,
  },
  howItWorksItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.circular.medium,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});

