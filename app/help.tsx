import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

export default function HelpFAQScreen() {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const BackIcon = APP_ICONS.back;
  const HelpCircleIcon = LucideIcons.HelpCircle;
  const CheckIcon = LucideIcons.Check;

  const faqItems = [
    {
      question: t('help.faq1.question'),
      answer: t('help.faq1.answer'),
    },
    {
      question: t('help.faq2.question'),
      answer: t('help.faq2.answer'),
    },
    {
      question: t('help.faq3.question'),
      answer: t('help.faq3.answer'),
    },
    {
      question: t('help.faq4.question'),
      answer: t('help.faq4.answer'),
    },
    {
      question: t('help.faq5.question'),
      answer: t('help.faq5.answer'),
    },
    {
      question: t('help.faq6.question'),
      answer: t('help.faq6.answer'),
    },
    {
      question: t('help.faq7.question'),
      answer: t('help.faq7.answer'),
    },
    {
      question: t('help.faq8.question'),
      answer: t('help.faq8.answer'),
    },
    {
      question: t('help.faq9.question'),
      answer: t('help.faq9.answer'),
    },
    {
      question: t('help.faq10.question'),
      answer: t('help.faq10.answer'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="help.title" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Intro Section */}
        <View style={styles.introSection}>
          <View style={[styles.iconContainer, { backgroundColor: borderColor + '15' }]}>
            <HelpCircleIcon size={32} color={iconColor} />
          </View>
          <ThemedText type="title" style={styles.introTitle} i18nKey="help.intro" />
          <ThemedText style={styles.introText} i18nKey="help.introDescription" />
        </View>

        {/* FAQ Items */}
        <View style={styles.faqSection}>
          {faqItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.faqItem,
                { backgroundColor: backgroundColor, borderColor: borderColor + '30' },
              ]}>
              <View style={styles.faqQuestionContainer}>
                <View style={[styles.questionIcon, { backgroundColor: borderColor + '15' }]}>
                  <CheckIcon size={16} color={iconColor} />
                </View>
                <ThemedText style={styles.faqQuestion}>{item.question}</ThemedText>
              </View>
              <ThemedText style={styles.faqAnswer}>{item.answer}</ThemedText>
            </View>
          ))}
        </View>

        {/* Contact Support Section */}
        <View style={styles.contactSection}>
          <View style={[styles.contactCard, { backgroundColor: borderColor + '15', borderColor: borderColor + '30' }]}>
            <ThemedText style={styles.contactTitle} i18nKey="help.stillNeedHelp" />
            <ThemedText style={styles.contactText} i18nKey="help.stillNeedHelpDescription" />
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}>
              <ThemedText style={[styles.contactButtonText, { color: buttonTextColor }]} i18nKey="help.contactSupport" />
            </TouchableOpacity>
          </View>
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
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  faqSection: {
    marginBottom: 32,
    gap: 16,
  },
  faqItem: {
    borderRadius: BORDER_RADIUS.large,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginLeft: 36,
  },
  contactSection: {
    marginTop: 8,
  },
  contactCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.medium,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

