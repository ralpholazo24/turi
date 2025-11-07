import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Group } from '@/types';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { getColorsFromPreset } from '@/utils/group-colors';
import { MemberAvatar } from './member-avatar';

interface GroupCardProps {
  group: Group;
  containerStyle?: object;
}

export function GroupCard({ group, containerStyle }: GroupCardProps) {
  const { t } = useTranslation();

  const handlePress = () => {
    router.push(`/group/${group.id}`);
  };

  const nextTask = group.tasks.find((task) => {
    if (task.memberIds.length === 0) return false;
    const assignedMember = group.members.find(
      (m) => m.id === task.memberIds[task.assignedIndex]
    );
    return assignedMember;
  });

  const assignedMember = nextTask
    ? group.members.find((m) => m.id === nextTask.memberIds[nextTask.assignedIndex])
    : null;

  const totalTasksCount = group.tasks.length;
  const totalMembersCount = group.members.length;

  // Get the icon component dynamically
  // eslint-disable-next-line import/namespace
  const IconComponent = LucideIcons[group.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;

  // Get colors from preset
  const colors = getColorsFromPreset(group.colorPreset);

  return (
    <TouchableOpacity
      style={[styles.cardContainer, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[colors.start, colors.end]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}>
        {/* Background Icon */}
        {IconComponent && (
          <View style={styles.backgroundIconContainer}>
            <IconComponent size={120} color="rgba(255, 255, 255, 0.25)" />
          </View>
        )}
        <View style={styles.cardContent}>
          {/* Top Section: Title */}
          <View style={styles.topSection}>
            <View style={styles.textSection}>
              <Text style={styles.groupName}>{group.name}</Text>
              {/* Info Chips under group name */}
              <View style={styles.infoChipsRow}>
                <View style={styles.infoChip}>
                  <APP_ICONS.clipboard size={12} color="#FFFFFF" />
                  <Text style={styles.infoChipText}>
                    {totalTasksCount} {totalTasksCount === 1 ? t('group.task') : t('group.tasks')}
                  </Text>
                </View>
                <View style={styles.infoChip}>
                  <APP_ICONS.users size={12} color="#FFFFFF" />
                  <Text style={styles.infoChipText}>
                    {totalMembersCount} {totalMembersCount === 1 ? t('group.member') : t('group.members')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Middle Section: Next Task */}
          {nextTask && assignedMember ? (
            <View style={styles.taskSection}>
              <Text style={styles.taskLabel}>{t('group.nextTask')}</Text>
              <Text style={styles.taskName}>{nextTask.name}</Text>
              <View style={styles.assigneeRow}>
                <Text style={styles.assignedLabel}>{t('group.assignedTo')}</Text>
                <Text style={styles.assigneeName}>{assignedMember.name}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.taskSection}>
              <Text style={styles.noTaskText}>
                {group.members.length === 0 ? t('group.noMembers') : t('group.noTasksAssigned')}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
    marginBottom: 16,
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
  },
  cardContent: {
    minHeight: 120,
    zIndex: 1,
  },
  topSection: {
    marginBottom: 14,
  },
  textSection: {
    flex: 1,
    minWidth: 0,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 28,
    flexShrink: 1,
    marginBottom: 8,
  },
  infoChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  taskSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  taskLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.75,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  taskName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 10,
    flexShrink: 1,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignedLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.75,
    fontWeight: '500',
  },
  assigneeName: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 1,
  },
  noTaskText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.75,
    fontStyle: 'italic',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
});
