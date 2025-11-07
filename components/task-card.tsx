import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { Group, Member, Task } from '@/types';
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
  containerStyle?: object;
}

export function TaskCard({
  task,
  assignedMember,
  onPress,
  groupColorStart,
  groupColorEnd,
  group,
  containerStyle,
}: TaskCardProps) {
  const { t } = useTranslation();
  const soloMode = isSoloMode(group);
  
  // Check if task is already completed
  const completionStatus = getTaskCompletionStatus(task);
  
  // Check if task is overdue
  const isOverdue = isTaskOverdue(task);
  
  // Get formatted schedule information with date
  const scheduleInfo = formatScheduleInfo(task, isOverdue);
  
  const CheckIcon = APP_ICONS.check;

  return (
    <TouchableOpacity
      style={[styles.cardContainer, containerStyle]}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[groupColorStart, groupColorEnd]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}>
        {/* Background Icon */}
        {(() => {
          // eslint-disable-next-line import/namespace
          const IconComponent = LucideIcons[task.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;
          return IconComponent ? (
            <View style={styles.backgroundIconContainer}>
              <IconComponent size={100} color="rgba(255, 255, 255, 0.25)" />
            </View>
          ) : null;
        })()}
        <View style={styles.cardContent}>
          {/* Top Section: Task Name and Info */}
          <View style={styles.topSection}>
            <View style={styles.textSection}>
              <Text style={styles.taskName}>{task.name}</Text>
              {/* Info Chips */}
              <View style={styles.infoChipsContainer}>
                {scheduleInfo && (
                  <View style={styles.infoChip}>
                    <APP_ICONS.calendar size={12} color="#FFFFFF" />
                    <Text style={styles.infoChipText}>
                      {scheduleInfo.text.split(' - ')[0]}
                    </Text>
                    {scheduleInfo.dateText && (
                      <Text style={[styles.infoChipText, styles.dateText]}>
                        {' - ' + scheduleInfo.dateText}
                      </Text>
                    )}
                  </View>
                )}
              </View>
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
                  <CheckIcon size={16} color="#10B981" />
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
    padding: 16,
    overflow: 'hidden',
  },
  backgroundIconContainer: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 1,
    zIndex: 0,
  },
  cardContent: {
    minHeight: 100,
    zIndex: 1,
  },
  topSection: {
    marginBottom: 14,
  },
  textSection: {
    flex: 1,
    minWidth: 0,
  },
  taskName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 28,
    flexShrink: 1,
    marginBottom: 8,
  },
  infoChipsContainer: {
    marginTop: 4,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    marginLeft: 6,
  },
  dateText: {
    marginLeft: 0,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 6,
  },
  pendingBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  pendingBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  overdueBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  overdueBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
