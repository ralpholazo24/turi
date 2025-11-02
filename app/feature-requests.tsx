import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import * as Linking from 'expo-linking';

export default function FeatureRequestsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');
  const inputBackgroundColor = useThemeColor(
    { light: '#F5F5F5', dark: '#2A2A2A' },
    'background'
  );

  const BackIcon = APP_ICONS.back;
  const SparklesIcon = LucideIcons.Sparkles;
  const SendIcon = LucideIcons.Send;

  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');

  const handleSubmit = () => {
    if (!featureTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your feature request.');
      return;
    }

    if (!featureDescription.trim()) {
      Alert.alert('Description Required', 'Please describe your feature request.');
      return;
    }

    // Create email body with feature request
    const subject = encodeURIComponent(`Feature Request: ${featureTitle}`);
    const body = encodeURIComponent(
      `Feature Request Details:\n\nTitle: ${featureTitle}\n\nDescription:\n${featureDescription}\n\n---\nSubmitted from Turi app`
    );
    const emailUrl = `mailto:ralpholazo@gmail.com?subject=${subject}&body=${body}`;

    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
          // Clear form after opening email
          setFeatureTitle('');
          setFeatureDescription('');
          Alert.alert(
            'Thank You!',
            'Your feature request has been opened in your email client. Please send it to submit your request.',
            [{ text: 'OK' }]
          );
        } else {
            Alert.alert(
              'Email Not Available',
              'Please email your feature request to: ralpholazo@gmail.com',
              [{ text: 'OK' }]
            );
        }
      })
      .catch(() => {
        Alert.alert(
          'Error',
          'Unable to open email client. Please email your feature request to: ralpholazo@gmail.com',
          [{ text: 'OK' }]
        );
      });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Feature Requests
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: borderColor + '15' }]}>
            <SparklesIcon size={20} color={iconColor} style={styles.infoIcon} />
            <ThemedText style={styles.infoText}>
              Have an idea for a new feature? We'd love to hear from you! Share your suggestions below.
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Title</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBackgroundColor,
                    color: textColor,
                    borderColor: borderColor + '30',
                  },
                ]}
                placeholder="What feature would you like to see?"
                placeholderTextColor={iconColor + '80'}
                value={featureTitle}
                onChangeText={setFeatureTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: inputBackgroundColor,
                    color: textColor,
                    borderColor: borderColor + '30',
                  },
                ]}
                placeholder="Describe your feature request in detail..."
                placeholderTextColor={iconColor + '80'}
                value={featureDescription}
                onChangeText={setFeatureDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <ThemedText style={styles.characterCount}>
                {featureDescription.length}/500
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: featureTitle.trim() && featureDescription.trim() ? '#10B981' : '#10B981' + '60',
                },
              ]}
              onPress={handleSubmit}
              disabled={!featureTitle.trim() || !featureDescription.trim()}
              activeOpacity={0.7}>
              <SendIcon size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Submit Feature Request</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    minHeight: 50,
  },
  textArea: {
    fontSize: 16,
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    minHeight: 150,
  },
  characterCount: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

