import { ConfirmationModal } from '@/components/confirmation-modal';
import { EditTaskModal } from '@/components/edit-task-modal';
import { MemberAvatar } from '@/components/member-avatar';
import { TaskContextMenu } from '@/components/task-context-menu';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { getDaysDifference, startOfDay } from '@/utils/date-helpers';
import { formatDetailedNextDueDate, getDueDateCountdown } from '@/utils/due-date-format';
import { calculateNextDueDate } from '@/utils/notification-schedule';
import { isSoloMode } from '@/utils/solo-mode';
import { getTaskCompletionStatus, isTaskOverdue } from '@/utils/task-completion';
import { formatScheduleInfo } from '@/utils/task-schedule';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskDetailsScreen() {
  const { t } = useTranslation();
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
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const BackIcon = APP_ICONS.back;
  const MenuIcon = APP_ICONS.menu;
  const CheckIcon = APP_ICONS.check;

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
          <ThemedText type="title" i18nKey="task.taskNotFound" />
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
    if (scheduleInfo) return scheduleInfo;
    // Fallback to frequency name
    if (task.frequency === 'daily') return t('task.daily');
    if (task.frequency === 'weekly') return t('task.weekly');
    return t('task.monthly');
  };

  // Determine what to show for due date (detailed date or countdown)
  const getDueDateDisplay = () => {
    if (isOverdue) {
      return t('common.overdue');
    }

    const nextDueDate = calculateNextDueDate(task);
    if (!nextDueDate) {
      return formatDetailedNextDueDate(task);
    }

    const now = new Date();
    const today = startOfDay(now);
    const dueDateStart = startOfDay(nextDueDate);
    const daysDiff = getDaysDifference(today, dueDateStart);

    // Show countdown if within 7 days, otherwise show detailed date
    if (daysDiff <= 7) {
      return getDueDateCountdown(task);
    } else {
      return formatDetailedNextDueDate(task);
    }
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
      return t('common.today');
    }
    if (dateStr === yesterdayStr) {
      return t('common.yesterday');
    }

    // Check if it's this week
    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 7) {
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayKey = dayKeys[date.getDay()];
      return t('task.lastDay', { day: t(`task.${dayKey}`) });
    }

    // Format as "Oct 12" using translated month abbreviations
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthAbbr = t(`common.monthAbbr.${monthKeys[date.getMonth()]}`);
    return `${monthAbbr} ${date.getDate()}`;
  };

  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? t('common.pm') : t('common.am');
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
                {!completionStatus.isCompleted && (
                  <Text style={[styles.nextDueDate, isOverdue && styles.overdueIndicator]}>
                    {getDueDateDisplay()}
                  </Text>
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
                {soloMode ? t('task.yourTurn') : currentMember.name}
              </ThemedText>
              {!soloMode && (
                <ThemedText style={styles.itYourTurn} i18nKey="task.itYourTurn" />
              )}
            </View>
          </View>
        )}

        {/* Completion History */}
        {sortedHistory.length > 0 && (
          <View style={styles.historySection}>
            <ThemedText type="subtitle" style={styles.historyTitle} i18nKey="task.completionHistory" />
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
            <Image
              source={require('@/assets/illustrations/beach-boy.svg')}
              style={styles.emptyIllustration}
              contentFit="contain"
              tintColor={iconColor}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle} i18nKey="task.noHistory" />
            <ThemedText style={styles.emptyText} i18nKey="task.noHistoryDescription" />
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor, borderTopColor: borderColor + '30' }]}>
        <TouchableOpacity
          style={[
            styles.markDoneButton,
            {
              backgroundColor: completionStatus.isCompleted ? '#6B7280' : buttonBackgroundColor,
            },
          ]}
          onPress={handleMarkDone}
          disabled={completionStatus.isCompleted}
          activeOpacity={completionStatus.isCompleted ? 1 : 0.8}>
          <CheckIcon size={24} color={buttonTextColor} />
          <ThemedText style={[styles.markDoneText, { color: buttonTextColor }]}>
            {completionStatus.isCompleted ? completionStatus.message : t('task.markDone')}
          </ThemedText>
        </TouchableOpacity>

        {!completionStatus.isCompleted && !soloMode && (
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: backgroundColor, borderColor: borderColor + '50' }]}
            onPress={handleSkipTurn}
            activeOpacity={0.8}>
            <ThemedText style={[styles.skipText, { color: group.colorStart }]} i18nKey="common.skip" />
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
        title={t('confirmation.skipTitle')}
        message={t('confirmation.skipMessage')}
        confirmText={t('common.skip')}
        cancelText={t('common.cancel')}
        confirmColor="#F97316"
        onConfirm={handleSkipConfirm}
        onCancel={() => setIsSkipConfirmationVisible(false)}
      />

      {/* Delete Task Confirmation */}
      <ConfirmationModal
        visible={isDeleteConfirmationVisible}
        title={t('confirmation.deleteTaskTitle')}
        message={t('confirmation.deleteTaskMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
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
    marginBottom: 4,
  },
  nextDueDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
    marginTop: 4,
  },
  countdown: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: 2,
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
    paddingTop: 20,
    paddingBottom: 60,
  },
  emptyIllustration: {
    width: 280,
    height: 280,
    opacity: 0.8,
    marginBottom: 12,
    marginTop: -20,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
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

