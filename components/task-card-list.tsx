import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Group } from '@/types';
import { TaskCard } from './task-card';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { APP_ICONS } from '@/constants/icons';

interface TaskCardListProps {
  group: Group;
}

export function TaskCardList({ group }: TaskCardListProps) {
  const textColor = useThemeColor({}, 'text');
  const ClipboardIcon = APP_ICONS.clipboard;

  const handleTaskPress = (taskId: string) => {
    router.push(`/group/${group.id}/task/${taskId}`);
  };

  if (group.tasks.length === 0) {
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
  },
});

