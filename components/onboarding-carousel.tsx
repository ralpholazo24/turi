import { AppMockup } from '@/components/app-mockup';
import { ThemedText } from '@/components/themed-text';
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
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreen {
  id: string;
  illustration?: any; // Optional for screens with mockups
  mockupType?: 'home' | 'group' | 'tasks' | 'solo'; // Type of app mockup to show
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
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { toggleNotifications } = useNotifications();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // Calculate responsive values for small screens
  const isSmallScreen = screenHeight < 700;
  // Always reserve space for progress bar to ensure consistent layouts across all screens
  // Progress bar is shown when currentIndex > 0, but we reserve space always to prevent layout shifts
  const progressBarHeight = 32; // Fixed height to ensure consistent layout across all screens
  const stickyButtonHeight = 88 + insets.bottom; // Button height + padding + safe area
  const availableHeight = screenHeight - insets.top - insets.bottom - progressBarHeight - stickyButtonHeight;
  
  // Better balanced sizing for small screens
  const mockupHeight = isSmallScreen ? Math.min(280, availableHeight * 0.45) : 500;
  const mockupWidth = isSmallScreen ? Math.min(240, SCREEN_WIDTH * 0.75) : 280;
  const illustrationSize = isSmallScreen ? 180 : 280;
  const headlineFontSize = isSmallScreen ? 24 : 32;
  const padding = isSmallScreen ? 16 : 24;
  const marginBottom = isSmallScreen ? 8 : 24; // Reduced margin between mockup and text
  const contentMarginTop = isSmallScreen ? 4 : 0; // Reduced margin
  const buttonPaddingVertical = isSmallScreen ? 14 : 18;
  const buttonFontSize = isSmallScreen ? 16 : 18;

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

    // Special rendering for notification screen
    // Note: Notification screen has buttons inside the modal, so no separate sticky button container needed
    if (item.isNotificationScreen) {
      return (
        <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: padding, paddingTop: padding, paddingBottom: padding }
            ]}
            showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={[styles.notificationTitleSection, { marginBottom: marginBottom, paddingHorizontal: padding }]}>
              <ThemedText type="title" style={[styles.notificationTitle, { fontSize: headlineFontSize }]} i18nKey={item.headlineKey} />
            </View>

            {/* Permission Explanation Modal */}
            <View style={[
              styles.permissionModal,
              {
                backgroundColor: backgroundColor,
                borderColor: borderColor + '40',
                padding: isSmallScreen ? 16 : 20,
                marginHorizontal: padding,
                marginBottom: isSmallScreen ? 24 : 32
              }
            ]}>
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
            <View style={[styles.notificationIllustration, { marginBottom: padding }]}>
              <Image
                source={item.illustration}
                style={[styles.notificationIllustrationImage, { width: illustrationSize, height: illustrationSize }]}
                contentFit="contain"
                tintColor={iconColor}
              />
            </View>
          </ScrollView>
        </View>
      );
    }

    // Calculate button container height for proper spacing
    const buttonHeight = buttonPaddingVertical * 2 + (isSmallScreen ? 50 : 56);
    const secondaryButtonHeight = item.onCtaSecondaryPress ? 44 : 0;
    const buttonContainerPadding = padding / 2;
    const buttonContainerHeight = buttonHeight + secondaryButtonHeight + buttonContainerPadding + insets.bottom;
    
    // Regular screen rendering
    return (
      <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: padding,
              paddingTop: isSmallScreen ? padding : padding * 1.5,
              paddingBottom: isSmallScreen ? padding : padding * 1.5, // Reduced padding, just enough spacing
            }
          ]}
          showsVerticalScrollIndicator={false}>
          {/* Mockup or Illustration */}
          <View style={[styles.illustrationSection, { marginBottom: marginBottom }]}>
            {item.mockupType ? (
              <AppMockup
                type={item.mockupType}
                isVisible={index === currentIndex}
                style={{ height: mockupHeight, width: mockupWidth }}
              />
            ) : item.illustration ? (
              <Image
                source={item.illustration}
                style={[styles.illustration, { width: illustrationSize, height: illustrationSize }]}
                contentFit="contain"
                tintColor={iconColor}
              />
            ) : null}
          </View>

          {/* Content */}
          <View style={[styles.contentSection, { marginTop: contentMarginTop }]}>
            <ThemedText
              type="title"
              style={[styles.headline, { fontSize: headlineFontSize, marginBottom: isSmallScreen ? 8 : 16, paddingHorizontal: padding }]}
              i18nKey={item.headlineKey}
            />
            <ThemedText
              style={[styles.subtext, { paddingHorizontal: padding, marginBottom: 0 }]}
              i18nKey={item.subtextKey}
            />
          </View>
        </ScrollView>

        {/* Sticky Buttons at Bottom */}
        <View style={[
          styles.stickyButtonContainer,
          {
            paddingBottom: Math.max(insets.bottom, isSmallScreen ? 8 : 16),
            backgroundColor,
            borderTopColor: borderColor + '30',
            paddingHorizontal: padding,
            paddingTop: isSmallScreen ? 12 : 16,
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.stickyButton,
              {
                backgroundColor: buttonBackgroundColor,
                paddingVertical: buttonPaddingVertical,
              }
            ]}
            onPress={handleCtaPress}
            activeOpacity={0.8}>
            <ThemedText
              style={[styles.stickyButtonText, { color: buttonTextColor, fontSize: buttonFontSize }]}
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
    position: 'relative',
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

