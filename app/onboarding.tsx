import { OnboardingCarousel } from '@/components/onboarding-carousel';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/store/use-user-store';
import { getRandomAvatarColor } from '@/utils/member-avatar';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const viewOnly = params.viewOnly === 'true';
  const { setUser, completeOnboarding, user } = useUserStore();
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const CloseIcon = APP_ICONS.back;

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
    if (!name.trim() || isCompleting) {
      return;
    }

    if (viewOnly && user) {
      // In view-only mode with existing user, just go back
      router.back();
      return;
    }

    setIsCompleting(true);

    try {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        // Auto-assign random avatar color
        await setUser(name.trim(), getRandomAvatarColor());
        await completeOnboarding();
        // Navigate to home screen
        router.replace('/(tabs)');
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
      fadeAnim.setValue(1);
    }
  };

  const handleGetStarted = () => {
    if (viewOnly && user) {
      // In view-only mode with existing user, just go back
      router.back();
      return;
    }
    // Fade in the name input screen
    fadeAnim.setValue(0);
    setShowNameInput(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLearnMore = () => {
    router.push('/help');
  };

  const handleDismiss = () => {
    router.back();
  };

  const onboardingScreens = [
    {
      id: '1',
      illustration: require('@/assets/illustrations/screen1.svg'),
      headlineKey: 'onboarding.screen1.headline',
      subtextKey: 'onboarding.screen1.subtext',
      ctaKey: 'onboarding.screen1.cta',
    },
    {
      id: '2',
      illustration: require('@/assets/illustrations/screen2.svg'),
      headlineKey: 'onboarding.screen2.headline',
      subtextKey: 'onboarding.screen2.subtext',
      ctaKey: 'onboarding.screen2.cta',
    },
    {
      id: '3',
      illustration: require('@/assets/illustrations/screen3.svg'),
      headlineKey: 'onboarding.screen3.headline',
      subtextKey: 'onboarding.screen3.subtext',
      ctaKey: 'onboarding.screen3.cta',
    },
    {
      id: '4',
      illustration: require('@/assets/illustrations/screen4.svg'),
      headlineKey: 'onboarding.screen4.headline',
      subtextKey: 'onboarding.screen4.subtext',
      ctaKey: 'onboarding.screen4.cta',
      onCtaPress: handleGetStarted,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Close button for view-only mode */}
        {viewOnly && (
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              activeOpacity={0.7}>
              <CloseIcon size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
        )}
        {showNameInput || isCompleting ? (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
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
                  editable={!isCompleting}
                />
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!name.trim() || isCompleting) && styles.continueButtonDisabled,
                  { backgroundColor: buttonBackgroundColor },
                ]}
                onPress={handleContinue}
                disabled={!name.trim() || isCompleting}
                activeOpacity={0.8}>
                <ThemedText
                  style={[styles.continueButtonText, { color: buttonTextColor }]}
                  i18nKey="onboarding.continue" />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        ) : (
          <OnboardingCarousel screens={onboardingScreens} onComplete={() => {}} />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    paddingTop: 8,
  },
  closeButton: {
    padding: 8,
  },
});

