import { ThemedText } from '@/components/themed-text';
import { TypingText } from '@/components/typing-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

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
}

interface OnboardingCarouselProps {
  screens: OnboardingScreen[];
  onComplete: () => void;
}

export function OnboardingCarousel({ screens, onComplete }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatedScreens, setAnimatedScreens] = useState<Set<number>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');
  const dotColor = useThemeColor({}, 'icon');
  const dotActiveColor = useThemeColor({}, 'text');

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(style);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);
    const index = Math.round(offsetX / SCREEN_WIDTH);
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
      setCurrentIndex(nextIndex);
    }
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

    const handleTextComplete = () => {
      setAnimatedScreens((prev) => new Set(prev).add(index));
    };

    const shouldAnimate = index === currentIndex && !animatedScreens.has(index);

    return (
      <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
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
          {shouldAnimate ? (
            <TypingText
              type="title"
              style={styles.headline}
              i18nKey={item.headlineKey}
              speed={40}
              onComplete={handleTextComplete}
            />
          ) : (
            <ThemedText type="title" style={styles.headline} i18nKey={item.headlineKey} />
          )}
          <ThemedText style={styles.subtext} i18nKey={item.subtextKey} />

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={handleCtaPress}
              activeOpacity={0.8}>
              <ThemedText
                style={[styles.ctaButtonText, { color: buttonTextColor }]}
                i18nKey={item.ctaKey}
              />
            </TouchableOpacity>

            {item.onCtaSecondaryPress && item.ctaSecondaryKey && (
              <TouchableOpacity
                style={styles.ctaSecondaryButton}
                onPress={handleSecondaryPress}
                activeOpacity={0.8}>
                <ThemedText style={styles.ctaSecondaryButtonText} i18nKey={item.ctaSecondaryKey} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPageIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {screens.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentIndex ? dotActiveColor : dotColor,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        ref={flatListRef}
        data={screens.map((screen, index) => ({ ...screen, _index: index }))}
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
          const index = Math.round(offsetX / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      {renderPageIndicators()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  illustration: {
    width: 240,
    height: 240,
    opacity: 0.8,
  },
  contentSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
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
    marginBottom: 48,
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    width: '100%',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  ctaSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

