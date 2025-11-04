import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/store/use-user-store';
import { getRandomAvatarColor } from '@/utils/member-avatar';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const { t } = useTranslation();
  const { setUser, completeOnboarding } = useUserStore();
  const [name, setName] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const handleContinue = async () => {
    if (!name.trim()) {
      return;
    }

    try {
      // Auto-assign random avatar color
      await setUser(name.trim(), getRandomAvatarColor());
      await completeOnboarding();
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={() => {}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <SafeAreaView style={[styles.content, { backgroundColor }]} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Illustration */}
            <View style={styles.illustrationSection}>
              <Image
                source={require('@/assets/illustrations/hello-with-balloons.svg')}
                style={styles.illustration}
                contentFit="contain"
                tintColor={iconColor}
              />
            </View>

            {/* Hello Message */}
            <View style={styles.headerSection}>
              <ThemedText type="title" style={styles.helloMessage} i18nKey="onboarding.welcome" />
              <ThemedText style={styles.subtitle} i18nKey="onboarding.subtitle" />
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t('onboarding.namePlaceholder')}
                placeholderTextColor={textColor + '80'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onSubmitEditing={handleContinue}
                returnKeyType="done"
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                !name.trim() && styles.continueButtonDisabled,
                { backgroundColor: buttonBackgroundColor },
              ]}
              onPress={handleContinue}
              disabled={!name.trim()}
              activeOpacity={0.8}>
              <ThemedText
                style={[styles.continueButtonText, { color: buttonTextColor }]}
                i18nKey="onboarding.continue" />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  illustration: {
    width: 220,
    height: 220,
    opacity: 0.85,
  },
  headerSection: {
    marginBottom: 36,
    alignItems: 'center',
  },
  helloMessage: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: 16,
    fontSize: 18,
    minHeight: 56,
  },
  continueButton: {
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

