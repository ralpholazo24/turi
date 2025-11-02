import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Group } from '@/types';

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

  const handlePress = () => {
    router.push(`/group/${group.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[group.colorStart, group.colorEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.cardContent}>
          {/* Top Section: Icon and Title */}
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Text style={styles.emoji}>{group.emoji}</Text>
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
                  <Text style={styles.avatarEmoji}>{assignedMember.emoji}</Text>
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
                  <Text style={styles.streakEmoji}>🔥</Text>
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
    borderRadius: 20,
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
    borderRadius: 20,
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
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
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
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 20,
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
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 4,
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
    borderRadius: 20,
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
