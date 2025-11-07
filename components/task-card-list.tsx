import { BORDER_RADIUS } from '@/constants/border-radius';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Group, Task } from '@/types';
import { getColorsFromPreset } from '@/utils/group-colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { SwipeableTaskCard } from './swipeable-task-card';
import { ThemedText } from './themed-text';

interface TaskCardListProps {
  group: Group;
  onOpenAddMember?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onReorderTasks?: (taskIds: string[]) => void;
}

export function TaskCardList({ 
  group, 
  onOpenAddMember, 
  onEditTask, 
  onDeleteTask,
  onReorderTasks,
}: TaskCardListProps) {
  const { t } = useTranslation();
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const handleTaskPress = useCallback((taskId: string) => {
    router.push(`/group/${group.id}/task/${taskId}`);
  }, [group.id]);

  const handleDragEnd = useCallback(
    ({ data }: { data: Task[] }) => {
      if (onReorderTasks) {
        const taskIds = data.map((task) => task.id);
        onReorderTasks(taskIds);
      }
    },
    [onReorderTasks]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Task>) => {
      // Find assigned member
      const assignedMember =
        item.memberIds.length > 0
          ? group.members.find((m) => m.id === item.memberIds[item.assignedIndex])
          : null;

      // Get colors from preset
      const colors = getColorsFromPreset(group.colorPreset);

      return (
        <ScaleDecorator>
          <SwipeableTaskCard
            task={item}
            assignedMember={assignedMember || null}
            groupColorStart={colors.start}
            groupColorEnd={colors.end}
            groupId={group.id}
            group={group}
            onPress={() => handleTaskPress(item.id)}
            onEdit={onEditTask || (() => {})}
            onDelete={onDeleteTask || (() => {})}
            drag={drag}
            isActive={isActive}
          />
        </ScaleDecorator>
      );
    },
    [group, handleTaskPress, onEditTask, onDeleteTask]
  );

  // Check if group has no tasks
  if (group.tasks.length === 0) {
    // If no members, show members message first
    if (group.members.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/illustrations/boy-sipping.svg')}
            style={styles.emptyIllustration}
            contentFit="contain"
            tintColor={iconColor}
          />
          <ThemedText type="subtitle" style={styles.emptyTitle} i18nKey="taskModal.noMembersYet" />
          <ThemedText style={styles.emptyText} i18nKey="taskModal.noMembersYetMessage" />
          {onOpenAddMember && (
            <TouchableOpacity
              style={[styles.addMembersButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={onOpenAddMember}
              activeOpacity={0.7}>
              <Text style={[styles.addMembersButtonText, { color: buttonTextColor }]}>{t('taskModal.addMembers')}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    // If members exist but no tasks
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('@/assets/illustrations/cat-and-woman.svg')}
          style={styles.emptyIllustration}
          contentFit="contain"
          tintColor={iconColor}
        />
        <ThemedText type="subtitle" style={styles.emptyTitle} i18nKey="group.noTasks" />
        <ThemedText style={styles.emptyText} i18nKey="group.noTasksDescription" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={group.tasks}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        activationDistance={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIllustration: {
    width: 280,
    height: 280,
    marginBottom: 24,
    opacity: 0.8,
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: 8,
    alignItems: 'center',
  },
  addMembersButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

