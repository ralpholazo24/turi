import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface TypingTextProps {
  i18nKey: string;
  speed?: number; // milliseconds per character
  style?: TextStyle | TextStyle[];
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  onComplete?: () => void;
}

export function TypingText({
  i18nKey,
  speed = 30,
  style,
  type = 'default',
  onComplete,
}: TypingTextProps) {
  const { t } = useTranslation();
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const fullText = t(i18nKey);
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!fullText) return;

    let currentIndex = 0;
    setDisplayedText('');
    setIsComplete(false);

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
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
  }, [fullText, speed, i18nKey]);

  // Show full text immediately if already complete
  if (isComplete || displayedText === fullText) {
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

