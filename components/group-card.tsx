import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Group } from '@/types';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { MemberAvatar } from './member-avatar';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
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
                  {nextTask.assignedIndex === 0 ? t('group.next') : t('group.nextUp')}
                  {nextTask.name}
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Section: Assigned User and Badge */}
          <View style={styles.bottomSection}>
            {assignedMember ? (
              <View style={styles.assignedSection}>
                <MemberAvatar member={assignedMember} size={32} />
                <Text style={styles.assignedText}>
                  {t('group.assignedTo')}{assignedMember.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.assignedText}>
                {group.members.length === 0 ? t('group.noMembers') : t('group.noTasksAssigned')}
              </Text>
            )}

            <View style={styles.rightSection}>
              {totalTasksCount > 0 ? (
                <View style={styles.taskCountBadge}>
                  <Text style={styles.taskCountText}>{totalTasksCount}</Text>
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
    padding: 20,
  },
  cardContent: {
    minHeight: 140,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 14,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIcon: {
    fontSize: 26,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  nextTask: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
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
    marginLeft: 10,
    flexShrink: 1,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  taskCountBadge: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.xlarge,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  taskCountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
