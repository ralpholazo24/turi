import { ThemedText } from '@/components/themed-text';
import { TypingText } from '@/components/typing-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { useNotifications } from '@/hooks/use-notifications';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreen {
  id: string;
  illustration: any;
  headlineKey: string;
  subtextKey: string;
  ctaKey: string;
  ctaSecondaryKey?: string;
  onCtaPress?: () => void;
  onCtaSecondaryPress?: () => void;
  isNotificationScreen?: boolean; // Special flag for notification screen
}

interface OnboardingCarouselProps {
  screens: OnboardingScreen[];
  onComplete: () => void;
}

export function OnboardingCarousel({ screens, onComplete }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatedScreens, setAnimatedScreens] = useState<Set<number>>(new Set());
  const [headlineCompleteScreens, setHeadlineCompleteScreens] = useState<Set<number>>(new Set());
  const [subtextCompleteScreens, setSubtextCompleteScreens] = useState<Set<number>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { toggleNotifications } = useNotifications();
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(style);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);
    const index = SCREEN_WIDTH > 0 ? Math.round(offsetX / SCREEN_WIDTH) : 0;
    if (index !== currentIndex) {
      setCurrentIndex(index);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      const nextIndex = currentIndex + 1;
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const renderProgressBar = () => {
    // Calculate progress width based on scroll position
    // Progress from 0% to 100% across all screens
    const maxScroll = (screens.length - 1) * SCREEN_WIDTH;
    const progressWidth = scrollX.interpolate({
      inputRange: [0, maxScroll],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.progressHeader}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: borderColor + '30' }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: buttonBackgroundColor,
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const handleEnableNotifications = async () => {
    await toggleNotifications(true);
    onComplete();
  };

  const handleSkipNotifications = () => {
    onComplete();
  };

  const renderScreen = ({ item, index }: { item: OnboardingScreen; index: number }) => {
    const handleCtaPress = () => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      if (item.onCtaPress) {
        item.onCtaPress();
      } else if (index < screens.length - 1) {
        handleNext();
      }
    };

    const handleSecondaryPress = () => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      item.onCtaSecondaryPress?.();
    };

    const handleHeadlineComplete = () => {
      setHeadlineCompleteScreens((prev) => new Set(prev).add(index));
    };

    const handleSubtextComplete = () => {
      setSubtextCompleteScreens((prev) => new Set(prev).add(index));
      setAnimatedScreens((prev) => new Set(prev).add(index));
    };

    // Once a screen is fully animated (both headline and subtext complete), never animate again
    const isFullyAnimated = animatedScreens.has(index);
    const headlineComplete = headlineCompleteScreens.has(index);
    const subtextComplete = subtextCompleteScreens.has(index);
    
    // Only animate if screen is current, not fully animated, and headline/subtext haven't completed yet
    const shouldAnimateHeadline = index === currentIndex && !isFullyAnimated && !headlineComplete;
    const shouldAnimateSubtext = index === currentIndex && !isFullyAnimated && headlineComplete && !subtextComplete;

    // Special rendering for notification screen
    if (item.isNotificationScreen) {
      return (
        <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.notificationTitleSection}>
              <ThemedText type="title" style={styles.notificationTitle} i18nKey={item.headlineKey} />
            </View>

            {/* Permission Explanation Modal */}
            <View style={[styles.permissionModal, { backgroundColor: backgroundColor, borderColor: borderColor + '40' }]}>
              <ThemedText style={styles.permissionModalTitle} i18nKey="onboarding.notificationPermissionTitle" />
              <ThemedText style={styles.permissionModalText} i18nKey="onboarding.notificationPermissionText" />
              <View style={[styles.permissionModalButtons, { borderTopColor: borderColor + '30' }]}>
                <TouchableOpacity
                  style={[styles.permissionModalButton, styles.permissionModalButtonLeft, styles.permissionModalButtonHighlighted, { borderRightColor: borderColor + '30', backgroundColor: buttonBackgroundColor }]}
                  onPress={handleEnableNotifications}
                  activeOpacity={0.8}>
                  <ThemedText style={[styles.permissionModalButtonText, { color: buttonTextColor }]} i18nKey="common.continue" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.permissionModalButton, styles.permissionModalButtonRight]}
                  onPress={handleSkipNotifications}
                  activeOpacity={0.7}>
                  <ThemedText style={[styles.permissionModalButtonText, { color: textColor, opacity: 0.6 }]} i18nKey="onboarding.dontAllow" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Illustration */}
            <View style={styles.notificationIllustration}>
              <Image
                source={item.illustration}
                style={styles.notificationIllustrationImage}
                contentFit="contain"
                tintColor={iconColor}
              />
            </View>
          </ScrollView>
        </View>
      );
    }

    // Regular screen rendering
    return (
      <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={styles.illustrationSection}>
            <Image
              source={item.illustration}
              style={styles.illustration}
              contentFit="contain"
              tintColor={iconColor}
            />
          </View>

          {/* Content */}
          <View style={styles.contentSection}>
            {shouldAnimateHeadline ? (
              <TypingText
                type="title"
                style={styles.headline}
                i18nKey={item.headlineKey}
                speed={70}
                onComplete={handleHeadlineComplete}
                enableHaptics={true}
              />
            ) : (
              <ThemedText type="title" style={styles.headline} i18nKey={item.headlineKey} />
            )}
            {shouldAnimateSubtext ? (
              <TypingText
                style={styles.subtext}
                i18nKey={item.subtextKey}
                speed={60}
                enableHaptics={true}
                onComplete={handleSubtextComplete}
              />
            ) : isFullyAnimated || subtextComplete ? (
              <ThemedText style={styles.subtext} i18nKey={item.subtextKey} />
            ) : (
              <ThemedText style={[styles.subtext, { opacity: 0 }]} i18nKey={item.subtextKey} />
            )}
          </View>
        </ScrollView>

        {/* Sticky Buttons at Bottom */}
        <View style={[styles.stickyButtonContainer, { paddingBottom: insets.bottom, backgroundColor, borderTopColor: borderColor + '30' }]}>
          <TouchableOpacity
            style={[styles.stickyButton, { backgroundColor: buttonBackgroundColor }]}
            onPress={handleCtaPress}
            activeOpacity={0.8}>
            <ThemedText
              style={[styles.stickyButtonText, { color: buttonTextColor }]}
              i18nKey={item.ctaKey}
            />
          </TouchableOpacity>

          {item.onCtaSecondaryPress && item.ctaSecondaryKey && (
            <TouchableOpacity
              style={styles.stickySecondaryButton}
              onPress={handleSecondaryPress}
              activeOpacity={0.8}>
              <ThemedText style={styles.stickySecondaryButtonText} i18nKey={item.ctaSecondaryKey} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const flatListData = useMemo(
    () => screens.map((screen, index) => ({ ...screen, _index: index })),
    [screens]
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {currentIndex > 0 && renderProgressBar()}
      <FlatList
        ref={flatListRef}
        data={flatListData}
        renderItem={({ item, index }) => renderScreen({ item, index })}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const index = SCREEN_WIDTH > 0 ? Math.round(offsetX / SCREEN_WIDTH) : 0;
          setCurrentIndex(index);
        }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  illustration: {
    width: 280,
    height: 280,
    opacity: 0.8,
  },
  contentSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 0,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
    marginBottom: 0,
  },
  stickyButtonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stickyButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  stickyButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  stickySecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  stickySecondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  notificationTitleSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  notificationTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionModal: {
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionModalText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionModalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 8,
  },
  permissionModalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  permissionModalButtonLeft: {
    borderRightWidth: 1,
  },
  permissionModalButtonRight: {
    borderRightWidth: 0,
  },
  permissionModalButtonHighlighted: {
    borderRadius: BORDER_RADIUS.medium,
  },
  permissionModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notificationIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  notificationIllustrationImage: {
    width: 280,
    height: 280,
    opacity: 0.8,
  },
});

