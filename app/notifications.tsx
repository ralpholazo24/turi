import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNotifications } from '@/hooks/use-notifications';
import { useAppStore } from '@/store/use-app-store';
import { rescheduleGroupNotifications } from '@/utils/notification-service';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

export default function NotificationsSettingsScreen() {
  const { t } = useTranslation();
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
  const tintColor = useThemeColor({}, 'tint');
  
  // Theme-aware icon colors
  const iconBgColor = iconColor + '20';

  const BackIcon = APP_ICONS.back;
  const BellIcon = LucideIcons.Bell;
  const [wasTryingToEnable, setWasTryingToEnable] = useState(false);

  // Watch for permission status changes and show alert if needed
  useEffect(() => {
    if (wasTryingToEnable && permissionStatus === 'denied' && !notificationsEnabled) {
      // Permission was denied when trying to enable notifications
      Alert.alert(
        t('notifications.permissionRequired'),
        t('notifications.permissionRequiredMessage'),
        [{ text: t('common.ok') }]
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
      return `${minutes} ${t('notifications.min')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${t('notifications.hr')}`;
    }
    return `${hours} ${t('notifications.hr')} ${mins} ${t('notifications.min')}`;
  };

  const handleReminderTimePress = () => {
    const options = [
      { label: t('notifications.minutes', { count: 5 }), value: 5 },
      { label: t('notifications.minutes', { count: 10 }), value: 10 },
      { label: t('notifications.minutes', { count: 15 }), value: 15 },
      { label: t('notifications.minutes', { count: 30 }), value: 30 },
      { label: t('notifications.hour', { count: 1 }), value: 60 },
      { label: t('notifications.hours', { count: 2 }), value: 120 },
      { label: t('common.cancel'), value: -1 },
    ];

    Alert.alert(
      t('notifications.reminderTime'),
      t('notifications.reminderTimeDescription'),
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
        <ThemedText type="title" style={styles.headerTitle} i18nKey="notifications.title" />
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
            <ThemedText style={styles.infoTitle} i18nKey="notifications.taskReminders" />
            <ThemedText style={styles.infoText} i18nKey="notifications.taskRemindersDescription" />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="notifications.settings" />
          
          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <BellIcon size={20} color={iconColor} />
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingText} i18nKey="notifications.enableNotifications" />
                  {permissionStatus === 'denied' && (
                    <ThemedText style={styles.settingSubtext} i18nKey="notifications.permissionRequiredDevice" />
                  )}
                  {permissionStatus === 'granted' && notificationsEnabled && (
                    <ThemedText style={styles.settingSubtext} i18nKey="notifications.youWillReceiveReminders" />
                  )}
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: borderColor + '60', true: tintColor }}
                thumbColor={backgroundColor}
                ios_backgroundColor={borderColor + '60'}
              />
            </View>
          </View>

          {notificationsEnabled && (
            <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleReminderTimePress}
                activeOpacity={0.7}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <BellIcon size={20} color={iconColor} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <ThemedText style={styles.settingText} i18nKey="notifications.remindMeBefore" />
                    <ThemedText style={styles.settingSubtext} i18nKey="notifications.getNotifiedBeforeTask" />
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <ThemedText style={styles.settingValue}>
                    {formatReminderTime(reminderMinutes)}
                  </ThemedText>
                  <LucideIcons.ChevronRight size={20} color={iconColor} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* How It Works */}
        {notificationsEnabled && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} i18nKey="notifications.howItWorks" />
            
            <View style={styles.howItWorksContainer}>
              <View style={styles.howItWorksItem}>
                <View style={[styles.stepNumber, { backgroundColor: iconBgColor }]}>
                  <ThemedText style={[styles.stepNumberText, { color: iconColor }]}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle} i18nKey="notifications.tasksAreScheduled" />
                  <ThemedText style={styles.stepDescription} i18nKey="notifications.tasksAreScheduledDescription" />
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={[styles.stepNumber, { backgroundColor: iconBgColor }]}>
                  <ThemedText style={[styles.stepNumberText, { color: iconColor }]}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle} i18nKey="notifications.youGetReminders" />
                  <ThemedText style={styles.stepDescription} i18nKey="notifications.youGetRemindersDescription" i18nOptions={{ time: formatReminderTime(reminderMinutes).toLowerCase() }} />
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={[styles.stepNumber, { backgroundColor: iconBgColor }]}>
                  <ThemedText style={[styles.stepNumberText, { color: iconColor }]}>3</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle} i18nKey="notifications.notificationsUpdateAutomatically" />
                  <ThemedText style={styles.stepDescription} i18nKey="notifications.notificationsUpdateAutomaticallyDescription" />
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
  settingItemContainer: {
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
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

