import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useAppStore } from '@/store/use-app-store';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { EditTaskModal } from '@/components/edit-task-modal';
import { TaskContextMenu } from '@/components/task-context-menu';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Task, Member } from '@/types';
import { getTaskCompletionStatus } from '@/utils/task-completion';
import { MemberAvatar } from '@/components/member-avatar';

export default function TaskDetailsScreen() {
  const { groupId, taskId } = useLocalSearchParams<{ groupId: string; taskId: string }>();
  const { groups, markTaskDone, skipTurn, deleteTask, initialize } = useAppStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isSkipConfirmationVisible, setIsSkipConfirmationVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const BackIcon = APP_ICONS.back;
  const MenuIcon = APP_ICONS.menu;
  const CheckIcon = APP_ICONS.check;
  const FlameIcon = APP_ICONS.flame;
  const ClipboardIcon = APP_ICONS.clipboard;

  useEffect(() => {
    initialize();
  }, [initialize]);

  const group = groups.find((g) => g.id === groupId);
  const task = group?.tasks.find((t) => t.id === taskId);

  if (!group || !task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ThemedText type="title">Task not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Get assigned members for this task
  const assignedMembers = group.members.filter((m) => task.memberIds.includes(m.id));
  const currentMember = assignedMembers[task.assignedIndex] || null;

  // Format frequency text
  const getFrequencyText = () => {
    if (task.frequency === 'daily') {
      return 'Daily';
    }
    // For weekly, we could show the day if we stored it
    return 'Weekly';
  };

  // Format completion date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    if (dateStr === todayStr) {
      return 'Today';
    }
    if (dateStr === yesterdayStr) {
      return 'Yesterday';
    }

    // Check if it's this week
    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Last ${days[date.getDay()]}`;
    }

    // Format as "Oct 12"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Get completion history sorted by date (newest first)
  const sortedHistory = [...(task.completionHistory || [])].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Check if task is already completed
  const completionStatus = getTaskCompletionStatus(task);

  const handleMarkDone = async () => {
    if (completionStatus.isCompleted) {
      return; // Already completed, don't do anything
    }
    await markTaskDone(group.id, task.id);
    router.back();
  };

  const handleSkipTurn = async () => {
    setIsSkipConfirmationVisible(true);
  };

  const handleSkipConfirm = async () => {
    setIsSkipConfirmationVisible(false);
    await skipTurn(group.id, task.id);
  };

  const handleDelete = () => {
    setIsDeleteConfirmationVisible(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteConfirmationVisible(false);
    await deleteTask(group.id, task.id);
    router.back();
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleMenuPress = () => {
    setIsContextMenuVisible(true);
  };

  // Get member name with possessive
  const getMemberTurnText = (member: Member) => {
    const name = member.name;
    const possessive = name.endsWith('s') ? `${name}'` : `${name}'s`;
    return `${possessive} turn`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <MenuIcon size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Task Overview Card */}
        <View style={[styles.taskCard, { backgroundColor: backgroundColor, borderColor: borderColor + '30' }]}>
          <View style={styles.taskCardContent}>
            <View style={[styles.iconContainer, { backgroundColor: group.colorStart + '20' }]}>
              {/* eslint-disable-next-line import/namespace */}
              {(() => {
                const IconComponent = LucideIcons[task.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                return IconComponent ? <IconComponent size={48} color="#11181C" /> : null;
              })()}
            </View>
            <View style={styles.taskInfo}>
              <ThemedText type="title" style={styles.taskName}>
                {task.name}
              </ThemedText>
              <ThemedText style={[styles.frequency, { color: group.colorStart }]}>
                {getFrequencyText()} {task.frequency === 'weekly' && 'on Wednesday'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Current Assignee Section */}
        {currentMember && (
          <View style={styles.currentAssigneeSection}>
            <MemberAvatar member={currentMember} size={56} />
            <View style={styles.assigneeInfo}>
              <ThemedText style={[styles.itYourTurn, { color: group.colorStart }]}>
                {getMemberTurnText(currentMember)}
              </ThemedText>
              <ThemedText style={styles.assigneeName}>{currentMember.name}</ThemedText>
            </View>
          </View>
        )}

        {/* Completion History */}
        {sortedHistory.length > 0 && (
          <View style={styles.historySection}>
            <ThemedText type="subtitle" style={styles.historyTitle}>
              Completion History
            </ThemedText>
            {sortedHistory.map((entry, index) => {
              const member = group.members.find((m) => m.id === entry.memberId);
              if (!member) return null;

              return (
                <View
                  key={index}
                  style={[
                    styles.historyItem,
                    { backgroundColor: backgroundColor, borderColor: borderColor + '30' },
                  ]}>
                  <View style={styles.historyItemContent}>
                    <MemberAvatar member={member} size={48} />
                    <View style={styles.historyTextContainer}>
                      <ThemedText style={styles.historyMemberName}>
                        {member.name}
                      </ThemedText>
                      <ThemedText style={styles.historyDate}>
                        {formatDate(entry.completedAt)}
                      </ThemedText>
                    </View>
                    {entry.memberStreakAtTime > 0 && (
                      <View style={styles.streakBadge}>
                        <FlameIcon size={14} color="#F97316" />
                        <ThemedText style={styles.streakText}>
                          {entry.memberStreakAtTime}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty History State */}
        {sortedHistory.length === 0 && (
          <View style={styles.emptyHistory}>
            <ClipboardIcon size={48} color={textColor} style={styles.emptyHistoryIcon} />
            <ThemedText style={styles.emptyHistoryText}>
              No completion history yet. Complete the task to see it here!
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor }]}>
        <TouchableOpacity
          style={[
            styles.markDoneButton,
            {
              backgroundColor: completionStatus.isCompleted ? '#6B7280' : '#10B981',
            },
          ]}
          onPress={handleMarkDone}
          disabled={completionStatus.isCompleted}
          activeOpacity={completionStatus.isCompleted ? 1 : 0.8}>
          <CheckIcon size={24} color="#FFFFFF" />
          <ThemedText style={styles.markDoneText}>
            {completionStatus.isCompleted ? completionStatus.message : 'Mark Done'}
          </ThemedText>
        </TouchableOpacity>

        {!completionStatus.isCompleted && (
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: backgroundColor, borderColor: borderColor + '50' }]}
            onPress={handleSkipTurn}
            activeOpacity={0.8}>
            <ThemedText style={[styles.skipText, { color: group.colorStart }]}>
              Skip Turn
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Task Modal */}
      <EditTaskModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        group={group}
        task={task}
      />

      {/* Task Context Menu */}
      <TaskContextMenu
        visible={isContextMenuVisible}
        onClose={() => setIsContextMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Skip Turn Confirmation */}
      <ConfirmationModal
        visible={isSkipConfirmationVisible}
        title="Skip Turn"
        message="Are you sure you want to skip this turn? The task will move to the next person."
        confirmText="Skip"
        cancelText="Cancel"
        confirmColor="#F97316"
        onConfirm={handleSkipConfirm}
        onCancel={() => setIsSkipConfirmationVisible(false)}
      />

      {/* Delete Task Confirmation */}
      <ConfirmationModal
        visible={isDeleteConfirmationVisible}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#EF4444"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmationVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerSpacer: {
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentAssigneeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  assigneeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itYourTurn: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  assigneeName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  historyItem: {
    borderRadius: BORDER_RADIUS.large,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  historyMemberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    opacity: 0.6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryIcon: {
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyHistoryText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

