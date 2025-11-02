import { ThemedText } from '@/components/themed-text';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageStore } from '@/store/use-language-store';
import { clearAllData } from '@/utils/clear-data';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { themePreference, updateThemePreference } = useColorScheme();
  const { notificationsEnabled, permissionStatus } = useNotifications();
  const { language } = useLanguageStore();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

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

  const [isClearDataModalVisible, setIsClearDataModalVisible] = useState(false);

  const isDarkMode = themePreference === 'dark';

  const handleToggleDarkMode = async (value: boolean) => {
    await updateThemePreference(value ? 'dark' : 'light');
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
            t('common.close'),
            'Please email your support request to: ralpholazo@gmail.com',
            [{ text: t('common.done') }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          t('common.close'),
          'Unable to open email client. Please email your support request to: ralpholazo@gmail.com',
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
              router.replace('/(tabs)/');
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
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/activity')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <ActivityIcon size={20} color="#3B82F6" />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.activity" />
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.preferences" />
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <BellIcon size={20} color="#10B981" />
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

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <MoonIcon size={20} color="#10B981" />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.darkMode" />
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/language')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <GlobeIcon size={20} color="#10B981" />
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

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.support" />
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/feature-requests')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <SparklesIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.featureRequests" />
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/help')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <HelpCircleIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.helpFAQ" />
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleContactSupport}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <HeadphonesIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.contactSupport" />
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/about')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <InfoIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.aboutApp" />
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} i18nKey="settings.data" />
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsClearDataModalVisible(true)}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#EF4444' + '20' }]}>
                <TrashIcon size={20} color="#EF4444" />
              </View>
              <ThemedText style={styles.settingText} i18nKey="settings.clearData" />
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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

