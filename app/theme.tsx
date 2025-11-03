import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Theme options
const THEME_OPTIONS = [
  { value: 'light', icon: 'Sun' },
  { value: 'dark', icon: 'Moon' },
  { value: 'system', icon: 'Monitor' },
] as const;

export default function ThemeScreen() {
  const { t } = useTranslation();
  const { themePreference, updateThemePreference } = useColorScheme();
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
  const CheckIcon = LucideIcons.Check;

  const handleThemeSelect = async (theme: 'light' | 'dark' | 'system') => {
    if (theme === themePreference) {
      return; // Already selected
    }

    await updateThemePreference(theme);
  };

  const getIconComponent = (iconName: string) => {
    // eslint-disable-next-line import/namespace
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;
    return IconComponent || LucideIcons.Settings;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="settings.theme" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: borderColor + '15' }]}>
          <LucideIcons.Palette size={20} color={iconColor} style={styles.infoIcon} />
          <ThemedText style={styles.infoText} i18nKey="theme.selectTheme" />
        </View>

        {/* Theme List */}
        <View style={styles.themeSection}>
          {THEME_OPTIONS.map((option) => {
            const IconComponent = getIconComponent(option.icon);
            const isSelected = themePreference === option.value;
            
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeItem,
                  { backgroundColor: backgroundColor, borderColor: borderColor + '30' },
                  isSelected && { backgroundColor: borderColor + '10' },
                ]}
                onPress={() => handleThemeSelect(option.value as 'light' | 'dark' | 'system')}
                activeOpacity={0.7}>
                <View style={styles.themeLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <IconComponent size={20} color={iconColor} />
                  </View>
                  <ThemedText style={styles.themeName} i18nKey={`theme.${option.value}`} />
                </View>
                {isSelected && (
                  <CheckIcon size={20} color={tintColor} />
                )}
              </TouchableOpacity>
            );
          })}
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
  infoCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  themeSection: {
    marginBottom: 24,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    marginBottom: 8,
  },
  themeLeft: {
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
  themeName: {
    fontSize: 16,
    fontWeight: '500',
  },
});

