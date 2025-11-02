import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useAppStore } from '@/store/use-app-store';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

export default function SettingsScreen() {
  const { groups } = useAppStore();
  const { themePreference, updateThemePreference } = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

  const BackIcon = APP_ICONS.back;
  const UsersIcon = APP_ICONS.users;
  const LockIcon = LucideIcons.Lock;
  const BellIcon = LucideIcons.Bell;
  const MoonIcon = LucideIcons.Moon;
  const GlobeIcon = LucideIcons.Globe;
  const HelpCircleIcon = LucideIcons.HelpCircle;
  const HeadphonesIcon = LucideIcons.Headphones;
  const InfoIcon = LucideIcons.Info;

  const isDarkMode = themePreference === 'dark';

  const handleToggleDarkMode = async (value: boolean) => {
    await updateThemePreference(value ? 'dark' : 'light');
  };

  const handleManageGroups = () => {
    router.push('/(tabs)');
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
        <ThemedText type="title" style={styles.headerTitle}>
          Settings
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ACCOUNT</ThemedText>
          
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}
            onPress={handleManageGroups}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <UsersIcon size={20} color="#3B82F6" />
              </View>
              <ThemedText style={styles.settingText}>Manage Groups</ThemedText>
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>PREFERENCES</ThemedText>
          
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}
            onPress={() => handleSettingPress('Notifications')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <BellIcon size={20} color="#10B981" />
              </View>
              <ThemedText style={styles.settingText}>Notifications</ThemedText>
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>

          <View style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <MoonIcon size={20} color="#10B981" />
              </View>
              <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
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
            style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}
            onPress={() => handleSettingPress('App Language')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <GlobeIcon size={20} color="#10B981" />
              </View>
              <ThemedText style={styles.settingText}>App Language</ThemedText>
            </View>
            <View style={styles.settingRight}>
              <ThemedText style={styles.settingValue}>English</ThemedText>
              <LucideIcons.ChevronRight size={20} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>SUPPORT</ThemedText>
          
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}
            onPress={() => handleSettingPress('Help & FAQ')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <HelpCircleIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText}>Help & FAQ</ThemedText>
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: borderColor + '30' }]}
            onPress={() => handleSettingPress('Contact Support')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <HeadphonesIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText}>Contact Support</ThemedText>
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress('About App')}
            activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <InfoIcon size={20} color={iconColor} />
              </View>
              <ThemedText style={styles.settingText}>About App</ThemedText>
            </View>
            <LucideIcons.ChevronRight size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
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
  settingText: {
    fontSize: 16,
    fontWeight: '500',
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

