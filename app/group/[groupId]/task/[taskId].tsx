import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
import { getTaskCompletionStatus, isTaskOverdue } from '@/utils/task-completion';
import { formatScheduleInfo } from '@/utils/task-schedule';
import { isSoloMode } from '@/utils/solo-mode';
import { MemberAvatar } from '@/components/member-avatar';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function TaskDetailsScreen() {
  const { groupId, taskId } = useLocalSearchParams<{ groupId: string; taskId: string }>();
  const { groups, markTaskDone, skipTurn, deleteTask, initialize } = useAppStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isSkipConfirmationVisible, setIsSkipConfirmationVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const BackIcon = APP_ICONS.back;
  const MenuIcon = APP_ICONS.menu;
  const CheckIcon = APP_ICONS.check;
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
    const scheduleInfo = formatScheduleInfo(task);
    return scheduleInfo || (task.frequency === 'daily' ? 'Daily' : task.frequency === 'weekly' ? 'Weekly' : 'Monthly');
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

  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Get completion history sorted by date (newest first)
  const sortedHistory = [...(task.completionHistory || [])].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Check if task is already completed
  const completionStatus = getTaskCompletionStatus(task);
  
  // Check if task is overdue
  const isOverdue = isTaskOverdue(task);
  
  // Check if group is in solo mode
  const soloMode = isSoloMode(group);

  const handleMarkDone = async () => {
    if (completionStatus.isCompleted) {
      return; // Already completed, don't do anything
    }
    // Trigger confetti animation
    setConfettiKey(prev => prev + 1);
    setShowConfetti(true);
    await markTaskDone(group.id, task.id);
    // Hide confetti after animation completes
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
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
    // Navigate immediately to avoid showing "not found" page
    router.back();
    // Delete task after navigation (Zustand store persists independently)
    await deleteTask(group.id, task.id);
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleMenuPress = () => {
    setIsContextMenuVisible(true);
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
        <View style={styles.taskCardContainer}>
          <LinearGradient
            colors={[group.colorStart, group.colorEnd]}
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.taskCardGradient}>
            <View style={styles.taskCardContent}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  {/* eslint-disable-next-line import/namespace */}
                  {(() => {
                    const IconComponent = LucideIcons[task.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                    return IconComponent ? <IconComponent size={48} color="#FFFFFF" /> : null;
                  })()}
                </View>
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>
                  {task.name}
                </Text>
                <Text style={styles.frequency}>
                  {getFrequencyText()}
                </Text>
                {!completionStatus.isCompleted && isOverdue && (
                  <Text style={styles.overdueIndicator}>Overdue</Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Current Assignee Section */}
        {currentMember && (
          <View style={styles.currentAssigneeSection}>
            <MemberAvatar member={currentMember} size={56} />
            <View style={styles.assigneeInfo}>
              <ThemedText style={styles.assigneeName}>
                {soloMode ? 'You' : currentMember.name}
              </ThemedText>
              {!soloMode && (
                <ThemedText style={styles.itYourTurn}>It&apos;s your turn</ThemedText>
              )}
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
                        {formatDate(entry.completedAt)} • {formatTime(entry.completedAt)}
                      </ThemedText>
                    </View>
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
      <View style={[styles.actionButtons, { backgroundColor, borderTopColor: borderColor + '30' }]}>
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

        {!completionStatus.isCompleted && !soloMode && (
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: backgroundColor, borderColor: borderColor + '50' }]}
            onPress={handleSkipTurn}
            activeOpacity={0.8}>
            <ThemedText style={[styles.skipText, { color: group.colorStart }]}>
              Skip
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

      {/* Skip Confirmation */}
      <ConfirmationModal
        visible={isSkipConfirmationVisible}
        title="Skip"
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

      {/* Confetti Animation */}
      {showConfetti && (
        <ConfettiCannon
          key={confettiKey}
          count={250}
          origin={{ x: Dimensions.get('window').width / 2, y: -50 }}
          fadeOut
          autoStart
          explosionSpeed={500}
          fallSpeed={4000}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#FFB6C1', '#87CEEB', '#DDA0DD']}
        />
      )}
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
  taskCardContainer: {
    marginBottom: 24,
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardGradient: {
    borderRadius: BORDER_RADIUS.xlarge,
    padding: 24,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  frequency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  overdueIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFB3BA',
    marginTop: 4,
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
  assigneeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itYourTurn: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
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

