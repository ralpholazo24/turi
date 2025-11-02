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
  const FlameIcon = APP_ICONS.flame;

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
              {!completionStatus.isCompleted && (
                <Text style={styles.dueDateText}>
                  {dueDateText}
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Section: Assigned Member and Badge */}
          <View style={styles.bottomSection}>
            {assignedMember ? (
              <View style={styles.assignedSection}>
                <View style={styles.avatarContainer}>
                  {/* eslint-disable-next-line import/namespace */}
                  {(() => {
                    const MemberIconComponent = LucideIcons[assignedMember.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                    return MemberIconComponent ? (
                      <MemberIconComponent size={20} color="#FFFFFF" />
                    ) : null;
                  })()}
                </View>
                <Text style={styles.assignedText}>
                  {assignedMember.name}&apos;s turn
                </Text>
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
              ) : assignedMember && assignedMember.streakCount > 0 ? (
                <View style={styles.streakBadge}>
                  <FlameIcon size={16} color="#FFFFFF" />
                  <Text style={styles.streakText}>{assignedMember.streakCount} Day Streak</Text>
                </View>
              ) : (
                <View style={styles.frequencyBadge}>
                  <CalendarIcon size={14} color="#FFFFFF" />
                  <Text style={styles.frequencyText}>
                    {task.frequency === 'daily' ? 'Daily' : 'Weekly'}
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
  dueDateText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
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
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.circular.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  assignedText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    gap: 4,
  },
  streakText: {
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
});

