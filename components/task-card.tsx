import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { Group, Member, Task } from '@/types';
import { isSoloMode } from '@/utils/solo-mode';
import { getTaskCompletionStatus, isTaskOverdue } from '@/utils/task-completion';
import { formatScheduleInfo } from '@/utils/task-schedule';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MemberAvatar } from './member-avatar';

interface TaskCardProps {
  task: Task;
  assignedMember: Member | null;
  onMarkDone: () => void; // Keep for compatibility but won't be used
  onPress?: () => void;
  groupColorStart: string;
  groupColorEnd: string;
  groupId: string;
  group: Group; // Add group for solo mode detection
}

export function TaskCard({
  task,
  assignedMember,
  onPress,
  groupColorStart,
  groupColorEnd,
  group,
}: TaskCardProps) {
  const soloMode = isSoloMode(group);
  // Calculate due date text
  const getDueDateText = () => {
    if (!task.lastCompletedAt) {
      if (task.frequency === 'daily') return 'Due Today';
      if (task.frequency === 'weekly') return 'Due This Week';
      if (task.frequency === 'monthly') return 'Due This Month';
    }

    const lastCompleted = new Date(task.lastCompletedAt!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCompleted.setHours(0, 0, 0, 0);

    const daysSince = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (task.frequency === 'daily') {
      if (daysSince === 0) return 'Due Tomorrow';
      if (daysSince >= 1) return 'Due Today';
    } else if (task.frequency === 'weekly') {
      const daysUntilNext = 7 - (daysSince % 7);
      if (daysUntilNext === 7) return 'Due Today';
      if (daysUntilNext === 1) return 'Due Tomorrow';
      return `Due in ${daysUntilNext} days`;
    } else if (task.frequency === 'monthly') {
      const lastCompletedMonth = lastCompleted.getMonth();
      const lastCompletedYear = lastCompleted.getFullYear();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      if (lastCompletedMonth === currentMonth && lastCompletedYear === currentYear) {
        return 'Due Next Month';
      }
      return 'Due This Month';
    }

    return task.frequency === 'daily' ? 'Due Today' : task.frequency === 'weekly' ? 'Due This Week' : 'Due This Month';
  };

  const dueDateText = getDueDateText();
  const isDueToday = dueDateText.includes('Today');
  
  // Check if task is already completed
  const completionStatus = getTaskCompletionStatus(task);
  
  // Check if task is overdue
  const isOverdue = isTaskOverdue(task);
  
  // Get formatted schedule information
  const scheduleInfo = formatScheduleInfo(task);
  
  const CheckIcon = APP_ICONS.check;
  const CalendarIcon = APP_ICONS.calendar;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[groupColorStart, groupColorEnd]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}>
        <View style={styles.cardContent}>
          {/* Top Section: Icon and Task Name */}
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                {/* eslint-disable-next-line import/namespace */}
                {(() => {
                  const IconComponent = LucideIcons[task.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                  return IconComponent ? (
                    <IconComponent size={28} color="#FFFFFF" />
                  ) : null;
                })()}
              </View>
            </View>
            <View style={styles.textSection}>
              <Text style={styles.taskName}>{task.name}</Text>
              {scheduleInfo && (
                <Text style={styles.scheduleText}>
                  {scheduleInfo}
                </Text>
              )}
              {!completionStatus.isCompleted && (
                <Text style={[styles.dueDateText, isOverdue && styles.overdueText]}>
                  {isOverdue ? 'Overdue' : dueDateText}
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Section: Assigned Member and Badge */}
          <View style={styles.bottomSection}>
            {assignedMember && !soloMode ? (
              <View style={styles.assignedSection}>
                <MemberAvatar member={assignedMember} size={32} />
                <Text style={styles.assignedText}>
                  {assignedMember.name}&apos;s turn
                </Text>
              </View>
            ) : assignedMember && soloMode ? (
              <View style={styles.assignedSection}>
                <MemberAvatar member={assignedMember} size={32} />
                <Text style={styles.assignedText}>You</Text>
              </View>
            ) : (
              <Text style={styles.assignedText}>
                No one assigned
              </Text>
            )}

            <View style={styles.rightSection}>
              {completionStatus.isCompleted ? (
                <View style={styles.completedBadge}>
                  <CheckIcon size={16} color="#FFFFFF" />
                  <Text style={styles.completedText}>Done</Text>
                </View>
              ) : isOverdue ? (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueBadgeText}>Overdue</Text>
                </View>
              ) : (
                <View style={styles.frequencyBadge}>
                  <CalendarIcon size={14} color="#FFFFFF" />
                  <Text style={styles.frequencyText}>
                    {task.frequency === 'daily' ? 'Daily' : task.frequency === 'weekly' ? 'Weekly' : 'Monthly'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
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
  gradient: {
    borderRadius: BORDER_RADIUS.xlarge,
    padding: 20,
  },
  cardContent: {
    minHeight: 120,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
  },
  taskName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
    marginBottom: 4,
    fontWeight: '500',
  },
  dueDateText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  overdueText: {
    color: '#FFB3BA',
    fontWeight: '600',
    opacity: 1,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assignedText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginLeft: 8,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overdueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 179, 186, 0.3)',
  },
  overdueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB3BA',
  },
});

