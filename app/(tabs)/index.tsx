import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useAppStore } from '@/store/use-app-store';
import { GroupCard } from '@/components/group-card';
import { AddGroupModal } from '@/components/add-group-modal';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

export default function HomeScreen() {
  const { groups, isLoading, initialize } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const PlusIcon = APP_ICONS.add;
  const UsersIcon = APP_ICONS.users;

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAddGroup = () => {
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Your Groups
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
            activeOpacity={0.7}>
            <LucideIcons.Settings size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Groups List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedText>Loading...</ThemedText>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <UsersIcon size={64} color={textColor} style={styles.emptyIcon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No groups yet
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Create your first group to start managing shared tasks!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddGroup}
        activeOpacity={0.8}>
        <PlusIcon size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Group Modal */}
      <AddGroupModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  groupsContainer: {
    gap: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.circular.large,
    backgroundColor: '#FF6B35', // Orange color from design
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
