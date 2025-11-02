import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.content}>
        <ThemedText type="title">Group Details</ThemedText>
        <ThemedText>Group ID: {groupId}</ThemedText>
        <ThemedText>This screen will be implemented next!</ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

