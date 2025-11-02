import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Group } from '@/types';
import { TaskCard } from './task-card';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { APP_ICONS } from '@/constants/icons';
import { BORDER_RADIUS } from '@/constants/border-radius';

interface TaskCardListProps {
  group: Group;
  onOpenAddMember?: () => void;
}

export function TaskCardList({ group, onOpenAddMember }: TaskCardListProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const ClipboardIcon = APP_ICONS.clipboard;
  const UsersIcon = APP_ICONS.users;

  const handleTaskPress = (taskId: string) => {
    router.push(`/group/${group.id}/task/${taskId}`);
  };

  // Check if group has no tasks
  if (group.tasks.length === 0) {
    // If no members, show members message first
    if (group.members.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <UsersIcon size={64} color={textColor} style={styles.emptyIcon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Members Yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            You don&apos;t have any members yet. Add some first to assign tasks!
          </ThemedText>
          {onOpenAddMember && (
            <TouchableOpacity
              style={styles.addMembersButton}
              onPress={onOpenAddMember}
              activeOpacity={0.7}>
              <Text style={styles.addMembersButtonText}>Add Members</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    // If members exist but no tasks
    return (
      <View style={styles.emptyContainer}>
        <ClipboardIcon size={64} color={textColor} style={styles.emptyIcon} />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No tasks yet
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Add your first task to get started!
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {group.tasks.map((task) => {
        // Find assigned member
        const assignedMember =
          task.memberIds.length > 0
            ? group.members.find((m) => m.id === task.memberIds[task.assignedIndex])
            : null;

        return (
          <TaskCard
            key={task.id}
            task={task}
            assignedMember={assignedMember || null}
            onMarkDone={() => {}} // No longer used, but kept for compatibility
            onPress={() => handleTaskPress(task.id)}
            groupColorStart={group.colorStart}
            groupColorEnd={group.colorEnd}
            groupId={group.id}
            group={group}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  addMembersButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: 8,
  },
  addMembersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

