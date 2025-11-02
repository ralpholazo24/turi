import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

export default function HelpFAQScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

  const BackIcon = APP_ICONS.back;
  const HelpCircleIcon = LucideIcons.HelpCircle;
  const CheckIcon = LucideIcons.Check;

  const faqItems = [
    {
      question: 'How do I create a group?',
      answer: 'On the home screen, tap the "+" button at the bottom right. Give your group a name, choose an icon and color theme, then add members.',
    },
    {
      question: 'How does task rotation work?',
      answer: 'When you create a task, it\'s assigned to the first member in your group. Each time someone marks the task as done, it automatically moves to the next person in the rotation.',
    },
    {
      question: 'What happens if I skip my turn?',
      answer: 'Skipping your turn moves the task to the next person without marking it as completed. The task will still be due and you can complete it later.',
    },
    {
      question: 'How do I schedule tasks?',
      answer: 'When creating or editing a task, you can set a frequency (daily, weekly, or monthly) and optionally specify a day of the week and time. For monthly tasks, you can also choose which week of the month.',
    },
    {
      question: 'What is solo mode?',
      answer: 'Solo mode automatically activates when you\'re the only member in a group. All tasks are assigned to you and rotation is disabled. It switches back to normal rotation when you add more members.',
    },
    {
      question: 'How do notifications work?',
      answer: 'Enable notifications in Settings, then choose how many minutes before a task is due you want to be reminded. Notifications are only sent for tasks that haven\'t been completed yet.',
    },
    {
      question: 'Can I change who\'s assigned to a task?',
      answer: 'Yes! You can skip turns to move assignments, or edit the task to change which members are assigned to it.',
    },
    {
      question: 'Where can I see task history?',
      answer: 'Open any task to see its completion history. The history shows who completed the task and when, with times displayed for each completion.',
    },
    {
      question: 'What if I delete a task by mistake?',
      answer: 'Unfortunately, deleted tasks cannot be recovered. Please be careful when deleting tasks or groups.',
    },
    {
      question: 'How do I customize group colors and icons?',
      answer: 'When creating or editing a group, you can choose from a variety of icons and color themes. Each group can have its own unique look!',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Help & FAQ
        </ThemedText>
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
          <ThemedText type="title" style={styles.introTitle}>
            How can we help?
          </ThemedText>
          <ThemedText style={styles.introText}>
            Find answers to common questions about using Turi.
          </ThemedText>
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
            <ThemedText style={styles.contactTitle}>Still need help?</ThemedText>
            <ThemedText style={styles.contactText}>
              If you can't find what you're looking for, feel free to contact our support team.
            </ThemedText>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}>
              <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

