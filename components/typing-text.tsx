import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, TextStyle } from 'react-native';

interface TypingTextProps {
  i18nKey: string;
  speed?: number; // milliseconds per character
  style?: TextStyle | TextStyle[];
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  onComplete?: () => void;
  enableHaptics?: boolean; // Enable haptic feedback during typing
  skipAnimation?: boolean; // If true, skip animation and show full text immediately
}

export function TypingText({
  i18nKey,
  speed = 30,
  style,
  type = 'default',
  onComplete,
  enableHaptics = false,
  skipAnimation = false,
}: TypingTextProps) {
  const { t } = useTranslation();
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const fullText = t(i18nKey);
  const textColor = useThemeColor({}, 'text');

  const triggerHaptic = useCallback(() => {
    if (enableHaptics && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [enableHaptics]);

  useEffect(() => {
    if (!fullText) return;

    // If skipAnimation is true, show full text immediately
    if (skipAnimation) {
      if (!isComplete) {
        setDisplayedText(fullText);
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    // Reset state when starting animation
    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        // Trigger haptics on every character, but only if enabled
        // The haptic system will naturally throttle rapid calls
        triggerHaptic();
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(typingInterval);
        onComplete?.();
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [fullText, speed, i18nKey, triggerHaptic, onComplete, skipAnimation]);

  // Show full text immediately if already complete or animation is skipped
  if (skipAnimation || isComplete || displayedText === fullText) {
    return <ThemedText type={type} style={style} i18nKey={i18nKey} />;
  }

  // Get base styles from ThemedText
  const baseStyle = type === 'title' ? styles.title : styles.default;
  
  return (
    <Text style={[baseStyle, { color: textColor }, style]}>
      {displayedText}
      {!isComplete && <Text style={[baseStyle, styles.cursor]}>|</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  cursor: {
    opacity: 0.7,
  },
});

