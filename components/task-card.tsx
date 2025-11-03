import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { Group, Member, Task } from '@/types';
import { formatNextDueDate } from '@/utils/due-date-format';
import { isSoloMode } from '@/utils/solo-mode';
import { getTaskCompletionStatus, isTaskOverdue } from '@/utils/task-completion';
import { formatScheduleInfo } from '@/utils/task-schedule';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const soloMode = isSoloMode(group);
  
  // Check if task is already completed
  const completionStatus = getTaskCompletionStatus(task);
  
  // Check if task is overdue
  const isOverdue = isTaskOverdue(task);
  
  // Get formatted schedule information
  const scheduleInfo = formatScheduleInfo(task);
  
  // Get next due date text using actual calculation
  const dueDateText = formatNextDueDate(task);
  
  const CheckIcon = APP_ICONS.check;

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
                  {isOverdue ? t('common.overdue') : dueDateText}
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Section: Assigned Member and Status Badge */}
          <View style={styles.bottomSection}>
            {assignedMember && !soloMode ? (
              <View style={styles.assignedSection}>
                <MemberAvatar member={assignedMember} size={32} />
                <Text style={styles.assignedText}>
                  {t('task.turn', { name: assignedMember.name })}
                </Text>
              </View>
            ) : assignedMember && soloMode ? (
              <View style={styles.assignedSection}>
                <MemberAvatar member={assignedMember} size={32} />
                <Text style={styles.assignedText}>{t('task.yourTurn')}</Text>
              </View>
            ) : (
              <Text style={styles.assignedText}>
                {t('task.noOneAssigned')}
              </Text>
            )}

            {/* Status Badge - Lower Right */}
            <View style={styles.statusBadgeContainer}>
              {completionStatus.isCompleted ? (
                <View style={styles.completedBadge}>
                  <CheckIcon size={16} color="#FFFFFF" />
                  <Text style={styles.completedText}>{t('common.done')}</Text>
                </View>
              ) : isOverdue ? (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueBadgeText}>{t('common.overdue')}</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{t('common.pending')}</Text>
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
  statusBadgeContainer: {
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
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pendingBadgeText: {
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
