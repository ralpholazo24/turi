import { BORDER_RADIUS } from '@/constants/border-radius';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Group, Task } from '@/types';
import { getColorsFromPreset } from '@/utils/group-colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/use-app-store';
import { ConfirmationModal } from './confirmation-modal';
import { SwipeableCard } from './swipeable-card';
import { TaskCard } from './task-card';
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
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [skipTaskId, setSkipTaskId] = useState<string | null>(null);
  const { markTaskDone, skipTurn } = useAppStore();

  const handleTaskPress = useCallback((taskId: string) => {
    router.push(`/group/${group.id}/task/${taskId}`);
  }, [group.id]);

  const handleSwipeStart = useCallback((taskId: string) => {
    // Close any other open card when a new swipe starts
    if (openCardId && openCardId !== taskId) {
      setOpenCardId(null);
    }
    // Set this card as the one being swiped
    setOpenCardId(taskId);
  }, [openCardId]);

  const handleDragEnd = useCallback(
    ({ data }: { data: Task[] }) => {
      if (onReorderTasks) {
        const taskIds = data.map((task) => task.id);
        onReorderTasks(taskIds);
      }
    },
    [onReorderTasks]
  );

  const handleMarkDone = useCallback(
    async (taskId: string) => {
      const task = group.tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Check if task has assigned members
      const assignedMembers = group.members.filter((m) =>
        task.memberIds.includes(m.id)
      );
      if (assignedMembers.length === 0) {
        Alert.alert(
          t('errors.cannotCompleteTask'),
          t('errors.taskNoMembers'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      try {
        await markTaskDone(group.id, taskId);
      } catch (error) {
        console.error('Error marking task as done:', error);
        Alert.alert(
          t('errors.cannotCompleteTask'),
          t('errors.unknownError'),
          [{ text: t('common.ok') }]
        );
      }
    },
    [group, markTaskDone, t]
  );

  const handleSkip = useCallback((taskId: string) => {
    setSkipTaskId(taskId);
  }, []);

  const handleSkipConfirm = useCallback(async () => {
    if (!skipTaskId) return;

    const task = group.tasks.find((t) => t.id === skipTaskId);
    if (!task) {
      setSkipTaskId(null);
      return;
    }

    // Check if task has assigned members
    const assignedMembers = group.members.filter((m) =>
      task.memberIds.includes(m.id)
    );
    if (assignedMembers.length === 0) {
      Alert.alert(
        t('errors.cannotSkipTurn'),
        t('errors.taskNoMembers'),
        [{ text: t('common.ok') }]
      );
      setSkipTaskId(null);
      return;
    }

    try {
      await skipTurn(group.id, skipTaskId);
    } catch (error) {
      console.error('Error skipping turn:', error);
      Alert.alert(
        t('errors.cannotSkipTurn'),
        t('errors.unknownError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setSkipTaskId(null);
    }
  }, [skipTaskId, group, skipTurn, t]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Task>) => {
      // Find assigned member
      const assignedMember =
        item.memberIds.length > 0
          ? group.members.find((m) => m.id === item.memberIds[item.assignedIndex])
          : null;

      // Get colors from preset
      const colors = getColorsFromPreset(group.colorPreset);
      const isCardOpen = openCardId === item.id;

      return (
        <SwipeableCard
          onEdit={() => onEditTask?.(item)}
          onDelete={() => onDeleteTask?.(item)}
          drag={drag}
          isActive={isActive}
          isOpen={isCardOpen}
          onSwipeStart={() => handleSwipeStart(item.id)}
          onSwipeClose={() => setOpenCardId(null)}>
          <TaskCard
            task={item}
            assignedMember={assignedMember || null}
            onPress={() => handleTaskPress(item.id)}
            onMarkDone={() => handleMarkDone(item.id)}
            onSkip={() => handleSkip(item.id)}
            groupColorStart={colors.start}
            groupColorEnd={colors.end}
            groupId={group.id}
            group={group}
            containerStyle={{ marginBottom: 0 }}
          />
        </SwipeableCard>
      );
    },
    [group, handleTaskPress, handleMarkDone, handleSkip, onEditTask, onDeleteTask, openCardId, handleSwipeStart]
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
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 + insets.bottom }, // FAB height (56) + bottom spacing (20) + extra padding (44) + safe area
        ]}
        showsVerticalScrollIndicator={false}
        activationDistance={10}
      />
      <ConfirmationModal
        visible={skipTaskId !== null}
        title={t('confirmation.skipTitle')}
        message={t('confirmation.skipMessage')}
        confirmText={t('common.skip')}
        cancelText={t('common.cancel')}
        confirmColor="#F97316"
        onConfirm={handleSkipConfirm}
        onCancel={() => setSkipTaskId(null)}
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
    paddingTop: 12,
    // paddingBottom is set dynamically based on safe area insets
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

