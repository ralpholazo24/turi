import { OnboardingCarousel } from '@/components/onboarding-carousel';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/store/use-user-store';
import { getRandomAvatarColor } from '@/utils/member-avatar';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ANIMATION_DELAY_MS = 100;

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
  viewOnly?: boolean; // If true, user can dismiss without completing
}

export function OnboardingModal({ visible, onComplete, viewOnly = false }: OnboardingModalProps) {
  const { t } = useTranslation();
  const { setUser, completeOnboarding, user } = useUserStore();
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { height: screenHeight } = useWindowDimensions();

  // Calculate responsive values for small screens
  const isSmallScreen = screenHeight < 700;
  const illustrationSize = isSmallScreen ? 120 : 160;
  const headlineFontSize = isSmallScreen ? 24 : 32;
  const padding = isSmallScreen ? 16 : 24;
  const paddingTop = isSmallScreen ? 24 : 40;
  const sectionMargin = isSmallScreen ? 20 : 32;

  const CloseIcon = APP_ICONS.back;

  // Reset states when modal closes
  useEffect(() => {
    if (!visible) {
      setShowNameInput(false);
      setName('');
      setIsCompleting(false);
      fadeAnim.setValue(1);
    }
  }, [visible]);

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
        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY_MS));
        // Keep showNameInput true until modal is fully closed to prevent carousel flash
        onComplete();
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
      fadeAnim.setValue(1);
    }
  };

  const handleOnboardingComplete = () => {
    if (viewOnly && user) {
      // In view-only mode with existing user, just close
      onComplete();
    } else {
      // Fade to name input screen
      fadeAnim.setValue(0);
      setShowNameInput(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleDismiss = () => {
    onComplete();
  };

  const onboardingScreens = [
    {
      id: '1',
      mockupType: 'home' as const,
      headlineKey: 'onboarding.screen1.headline',
      subtextKey: 'onboarding.screen1.subtext',
      ctaKey: 'onboarding.screen1.cta',
    },
    {
      id: '2',
      mockupType: 'group' as const,
      headlineKey: 'onboarding.screen2.headline',
      subtextKey: 'onboarding.screen2.subtext',
      ctaKey: 'onboarding.screen2.cta',
    },
    {
      id: '3',
      mockupType: 'tasks' as const,
      headlineKey: 'onboarding.screen3.headline',
      subtextKey: 'onboarding.screen3.subtext',
      ctaKey: 'onboarding.screen3.cta',
    },
    {
      id: '4',
      mockupType: 'solo' as const,
      headlineKey: 'onboarding.screen4.headline',
      subtextKey: 'onboarding.screen4.subtext',
      ctaKey: 'onboarding.screen4.cta',
    },
    {
      id: '5',
      illustration: require('@/assets/illustrations/hello-with-balloons.svg'),
      headlineKey: 'onboarding.screen5.headline',
      subtextKey: 'onboarding.screen5.subtext',
      ctaKey: 'onboarding.screen5.cta',
      ctaSecondaryKey: 'onboarding.screen5.ctaSecondary',
      isNotificationScreen: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={viewOnly ? handleDismiss : undefined}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <SafeAreaView style={[styles.content, { backgroundColor }]} edges={['top', 'bottom']}>
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
                contentContainerStyle={[
                  styles.scrollContent,
                  {
                    paddingHorizontal: padding,
                    paddingTop: paddingTop,
                    paddingBottom: padding,
                  }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Illustration */}
                <View style={[styles.illustrationSection, { marginBottom: sectionMargin }]}>
                  <Image
                    source={require('@/assets/illustrations/icon.svg')}
                    style={[styles.illustration, { width: illustrationSize, height: illustrationSize }]}
                    contentFit="contain"
                    tintColor={textColor}
                  />
                </View>

                {/* Hello Message */}
                <View style={[styles.headerSection, { marginBottom: sectionMargin }]}>
                  <ThemedText
                    type="title"
                    style={[styles.helloMessage, { fontSize: headlineFontSize }]}
                    i18nKey="onboarding.welcome"
                  />
                  <ThemedText style={styles.subtitle} i18nKey="onboarding.subtitle" />
                </View>

                {/* Name Input */}
                <View style={[styles.inputSection, { marginBottom: sectionMargin }]}>
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
            <OnboardingCarousel screens={onboardingScreens} onComplete={handleOnboardingComplete} />
          )}
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
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustration: {
    opacity: 1,
  },
  headerSection: {
    alignItems: 'center',
  },
  helloMessage: {
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

