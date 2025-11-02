import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { Member, Task } from '@/types';
import { getTaskCompletionStatus } from '@/utils/task-completion';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  assignedMember: Member | null;
  onMarkDone: () => void; // Keep for compatibility but won't be used
  onPress?: () => void;
  groupColorStart: string;
  groupColorEnd: string;
  groupId: string;
}

export function TaskCard({
  task,
  assignedMember,
  onPress,
  groupColorStart,
  groupColorEnd,
}: TaskCardProps) {
  // Calculate due date text
  const getDueDateText = () => {
    if (!task.lastCompletedAt) {
      return task.frequency === 'daily' ? 'Due Today' : 'Due This Week';
    }

    const lastCompleted = new Date(task.lastCompletedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCompleted.setHours(0, 0, 0, 0);

    const daysSince = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (task.frequency === 'daily') {
      if (daysSince === 0) return 'Due Tomorrow';
      if (daysSince >= 1) return 'Due Today';
    } else {
      // Weekly
      const daysUntilNext = 7 - (daysSince % 7);
      if (daysUntilNext === 7) return 'Due Today';
      if (daysUntilNext === 1) return 'Due Tomorrow';
      return `Due in ${daysUntilNext} days`;
    }

    return task.frequency === 'daily' ? 'Due Today' : 'Due This Week';
  };

  const dueDateText = getDueDateText();
  const isDueToday = dueDateText.includes('Today');
  
  // Check if task is already completed
  const completionStatus = getTaskCompletionStatus(task);
  
  const CheckIcon = APP_ICONS.check;
  const CalendarIcon = APP_ICONS.calendar;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}>
      <LinearGradient
        colors={[groupColorStart + '15', groupColorEnd + '15']}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}>
        <View style={styles.cardContent}>
          {/* Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: groupColorStart + '20' }]}>
            {/* eslint-disable-next-line import/namespace */}
            {(() => {
              const IconComponent = LucideIcons[task.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
              return IconComponent ? (
                <IconComponent size={28} color={groupColorStart} />
              ) : null;
            })()}
          </View>

          {/* Content */}
          <View style={styles.contentSection}>
            <View style={styles.topRow}>
              <Text style={styles.taskName} numberOfLines={1}>
                {task.name}
              </Text>
              {completionStatus.isCompleted && (
                <View style={styles.completedBadge}>
                  <CheckIcon size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              {/* Frequency Badge */}
              <View style={[styles.frequencyBadge, { backgroundColor: groupColorStart + '15' }]}>
                <CalendarIcon size={12} color={groupColorStart} />
                <Text style={[styles.frequencyText, { color: groupColorStart }]}>
                  {task.frequency === 'daily' ? 'Daily' : 'Weekly'}
                </Text>
              </View>

              {/* Due Date - Only show if not completed */}
              {!completionStatus.isCompleted && (
                <Text
                  style={[
                    styles.dueDate,
                    isDueToday && styles.dueDateUrgent,
                    {
                      color: isDueToday ? '#EF4444' : '#687076',
                    },
                  ]}>
                  {dueDateText}
                </Text>
              )}
            </View>

            {/* Assigned Member */}
            {assignedMember && (
              <View style={styles.assigneeRow}>
                <View style={styles.memberAvatar}>
                  {/* eslint-disable-next-line import/namespace */}
                  {(() => {
                    const MemberIconComponent = LucideIcons[assignedMember.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                    return MemberIconComponent ? (
                      <MemberIconComponent size={16} color={groupColorStart} />
                    ) : null;
                  })()}
                </View>
                <Text style={[styles.assigneeText, { color: groupColorStart }]}>
                  {assignedMember.name}&apos;s turn
                </Text>
              </View>
            )}
          </View>

          {/* Arrow Indicator */}
          <View style={styles.arrowContainer}>
            <LucideIcons.ChevronRight size={20} color="#687076" opacity={0.4} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: BORDER_RADIUS.large,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentSection: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  taskName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#11181C',
    flex: 1,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circular.medium,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.small,
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  dueDateUrgent: {
    fontWeight: '600',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circular.small,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

