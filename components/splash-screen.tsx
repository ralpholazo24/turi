import { Colors } from '@/constants/theme';
import { useThemeStore } from '@/store/use-theme-store';
import { Image } from 'expo-image';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { StyleSheet, View } from 'react-native';

export function CustomSplashScreen() {
  const themeStore = useThemeStore();
  const systemColorScheme = useRNColorScheme();
  
  // Determine color scheme: use system as fallback if theme isn't ready
  // This ensures immediate rendering without waiting for theme initialization
  const effectiveScheme = themeStore.isLoading 
    ? (systemColorScheme ?? 'light')
    : (themeStore.themePreference === 'system' 
        ? (systemColorScheme ?? 'light')
        : themeStore.themePreference);
  
  // Use Colors directly to avoid dependency on useThemeColor hook
  // This ensures the component renders immediately even if theme isn't ready
  const backgroundColor = Colors[effectiveScheme].background;
  const iconColor = Colors[effectiveScheme].text;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Image
        source={require('@/assets/illustrations/icon.svg')}
        style={styles.icon}
        contentFit="contain"
        tintColor={iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 160,
    height: 160,
  },
});

