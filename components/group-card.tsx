import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { Group } from '@/types';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
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

  const completedTasksCount = group.tasks.filter((task) => task.lastCompletedAt).length;
  const totalTasksCount = group.tasks.length;

  const FlameIcon = APP_ICONS.flame;

  const handlePress = () => {
    router.push(`/group/${group.id}`);
  };

  // Get the icon component dynamically
  // eslint-disable-next-line import/namespace
  const IconComponent = LucideIcons[group.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[group.colorStart, group.colorEnd]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}>
        <View style={styles.cardContent}>
          {/* Top Section: Icon and Title */}
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                {IconComponent ? (
                  <IconComponent size={28} color="#FFFFFF" />
                ) : (
                  <Text style={styles.fallbackIcon}>🏠</Text>
                )}
              </View>
            </View>
            <View style={styles.textSection}>
              <Text style={styles.groupName}>{group.name}</Text>
              {nextTask && (
                <Text style={styles.nextTask}>
                  {nextTask.assignedIndex === 0 ? 'Next: ' : 'Next up: '}
                  {nextTask.name}
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Section: Assigned User and Badge */}
          <View style={styles.bottomSection}>
            {assignedMember ? (
              <View style={styles.assignedSection}>
                <View style={styles.avatarContainer}>
                  {/* eslint-disable-next-line import/namespace */}
                  {(() => {
                    const MemberIconComponent = LucideIcons[assignedMember.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                    return MemberIconComponent ? <MemberIconComponent size={20} color="#FFFFFF" /> : null;
                  })()}
                </View>
                <Text style={styles.assignedText}>
                  Assigned to: {assignedMember.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.assignedText}>
                {group.members.length === 0 ? 'No members yet' : 'No tasks assigned'}
              </Text>
            )}

            <View style={styles.rightSection}>
              {assignedMember && assignedMember.streakCount > 0 ? (
                <View style={styles.streakBadge}>
                  <FlameIcon size={16} color="#FFFFFF" />
                  <Text style={styles.streakText}>{assignedMember.streakCount} Day Streak</Text>
                </View>
              ) : totalTasksCount > 0 ? (
                <View style={styles.progressBadge}>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>
                      {completedTasksCount}/{totalTasksCount}
                    </Text>
                  </View>
                  <Text style={styles.progressLabel}>Done</Text>
                </View>
              ) : null}
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
    minHeight: 140,
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
  fallbackIcon: {
    fontSize: 28,
  },
  textSection: {
    flex: 1,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextTask: {
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
  progressBadge: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xlarge,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
