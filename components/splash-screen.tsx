import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export function CustomSplashScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Image
        source={require('@/assets/illustrations/icon.svg')}
        style={styles.icon}
        contentFit="contain"
        tintColor={textColor}
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
    width: 120,
    height: 120,
  },
});

