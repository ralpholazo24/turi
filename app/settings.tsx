import { ConfirmationModal } from '@/components/confirmation-modal';
import { ProfileModal } from '@/components/profile-modal';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageStore } from '@/store/use-language-store';
import { useUserStore } from '@/store/use-user-store';
import { clearAllData } from '@/utils/clear-data';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { themePreference } = useColorScheme();
  const { notificationsEnabled, permissionStatus } = useNotifications();
  const { language } = useLanguageStore();
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
  const dangerColor = useThemeColor(
    { light: '#EF4444', dark: '#F87171' },
    'icon'
  );
  const dangerBgColor = dangerColor + '20';

  const BackIcon = APP_ICONS.back;
  const BellIcon = LucideIcons.Bell;
  const MoonIcon = LucideIcons.Moon;
  const GlobeIcon = LucideIcons.Globe;
  const HelpCircleIcon = LucideIcons.HelpCircle;
  const HeadphonesIcon = LucideIcons.Headphones;
  const InfoIcon = LucideIcons.Info;
  const ActivityIcon = LucideIcons.Activity;
  const SparklesIcon = LucideIcons.Sparkles;
  const TrashIcon = LucideIcons.Trash2;
  const UserIcon = LucideIcons.User;

  const { user } = useUserStore();
  const [isClearDataModalVisible, setIsClearDataModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const getThemeDisplayName = () => {
    if (themePreference === 'light') return t('theme.light');
    if (themePreference === 'dark') return t('theme.dark');
    return t('theme.system');
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request - Turi App');
    const body = encodeURIComponent('Hello,\n\nI need help with the following:\n\n');
    const emailUrl = `mailto:ralpholazo@gmail.com?subject=${subject}&body=${body}`;

    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert(
            t('settings.emailErrorTitle'),
            t('settings.emailError'),
            [{ text: t('common.done') }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          t('settings.emailErrorTitle'),
          t('settings.emailError'),
          [{ text: t('common.done') }]
        );
      });
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      setIsClearDataModalVisible(false);
      Alert.alert(
        t('settings.dataCleared'),
        t('settings.dataClearedMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Navigate to home screen
              router.replace('/(tabs)' as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert(
        t('common.close'),
        'An error occurred while clearing data. Please try again.',
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleSettingPress = (setting: string) => {
    // Placeholder for future navigation
    console.log(`Navigate to ${setting}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="settings.title" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.account" />
          
          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsProfileModalVisible(true)}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <UserIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.profile" />
              </View>
              <View style={styles.settingRight}>
                {user && (
                  <ThemedText style={styles.settingValue}>
                    {user.name}
                  </ThemedText>
                )}
                <LucideIcons.ChevronRight size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/activity')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <ActivityIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.activity" />
              </View>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.preferences" />
          
          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <BellIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.notifications" />
              </View>
              <View style={styles.settingRight}>
                {permissionStatus === 'denied' && (
                  <ThemedText style={styles.settingValue} i18nKey="settings.permissionRequired" />
                )}
                {notificationsEnabled && permissionStatus !== 'denied' && (
                  <ThemedText style={styles.settingValue} i18nKey="settings.notificationsEnabled" />
                )}
                <LucideIcons.ChevronRight size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/theme')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <MoonIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.theme" />
              </View>
              <View style={styles.settingRight}>
                <ThemedText style={styles.settingValue}>
                  {getThemeDisplayName()}
                </ThemedText>
                <LucideIcons.ChevronRight size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/language')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <GlobeIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.appLanguage" />
              </View>
              <View style={styles.settingRight}>
                <ThemedText style={styles.settingValue}>
                  {language === 'es' ? t('settings.spanish') : t('settings.english')}
                </ThemedText>
                <LucideIcons.ChevronRight size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.support" />
          
          {/* Feature Requests - Hidden for now */}
          {/* <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/feature-requests')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <SparklesIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.featureRequests" />
              </View>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </TouchableOpacity>
          </View> */}

          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/help')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <HelpCircleIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.helpFAQ" />
              </View>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleContactSupport}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <HeadphonesIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.contactSupport" />
              </View>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/about')}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  <InfoIcon size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.settingText} i18nKey="settings.aboutApp" />
              </View>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.data" />
          
          <View style={[styles.settingItemContainer, { borderColor: borderColor + '30' }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsClearDataModalVisible(true)}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: dangerBgColor }]}>
                  <TrashIcon size={20} color={dangerColor} />
                </View>
                <ThemedText style={[styles.settingText, { color: dangerColor }]} i18nKey="settings.clearData" />
              </View>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        visible={isClearDataModalVisible}
        title={t('confirmation.clearDataTitle')}
        message={t('confirmation.clearDataMessage')}
        confirmText={t('settings.clearData')}
        cancelText={t('common.cancel')}
        confirmColor="#EF4444"
        onConfirm={handleClearData}
        onCancel={() => setIsClearDataModalVisible(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />

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
});

