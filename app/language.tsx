import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageStore } from '@/store/use-language-store';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  // Add more languages here as translations are added
];

const getLanguageName = (code: string): string => {
  return LANGUAGES.find(l => l.code === code)?.name || code.toUpperCase();
};

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

  const BackIcon = APP_ICONS.back;
  const GlobeIcon = LucideIcons.Globe;
  const CheckIcon = LucideIcons.Check;

  const handleLanguageSelect = async (langCode: string) => {
    if (langCode === language) {
      return; // Already selected
    }

    await setLanguage(langCode);
    Alert.alert(
      t('common.done'),
      t('language.languageChanged', { name: getLanguageName(langCode) }),
      [{ text: t('common.ok') }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="settings.appLanguage" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: borderColor + '15' }]}>
          <GlobeIcon size={20} color={iconColor} style={styles.infoIcon} />
          <ThemedText style={styles.infoText} i18nKey="language.selectLanguage" />
        </View>

        {/* Language List */}
        <View style={styles.languageSection}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                { backgroundColor: backgroundColor, borderColor: borderColor + '30' },
                language === lang.code && { backgroundColor: borderColor + '10' },
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.7}>
              <View style={styles.languageLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                  <GlobeIcon size={20} color="#10B981" />
                </View>
                <ThemedText style={styles.languageName}>{lang.name}</ThemedText>
              </View>
              {language === lang.code && (
                <CheckIcon size={20} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={styles.noteSection}>
          <ThemedText style={styles.noteText} i18nKey="language.moreLanguagesComing" />
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
  languageSection: {
    marginBottom: 24,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    marginBottom: 12,
  },
  languageLeft: {
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
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  noteSection: {
    paddingVertical: 16,
  },
  noteText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
});

