import { View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Group } from '@/types';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

interface MemberChipListProps {
  group: Group;
}

export function MemberChipList({ group }: MemberChipListProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const UsersIcon = APP_ICONS.users;
  const FlameIcon = APP_ICONS.flame;

  if (group.members.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <UsersIcon size={64} color={textColor} style={styles.emptyIcon} />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No members yet
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Add members to start assigning tasks!
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {group.members.map((member, index) => (
        <View
          key={member.id}
          style={[
            styles.memberCard,
            { backgroundColor, borderColor: borderColor + '50' },
          ]}>
          <View style={styles.memberContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {/* eslint-disable-next-line import/namespace */}
              {(() => {
                const IconComponent = LucideIcons[member.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                return IconComponent ? <IconComponent size={32} color="#11181C" /> : null;
              })()}
            </View>

            {/* Member Info */}
            <View style={styles.memberInfo}>
              <ThemedText style={styles.memberName}>{member.name}</ThemedText>
              {member.streakCount > 0 ? (
                <View style={styles.streakContainer}>
                  <FlameIcon size={16} color="#F97316" />
                  <ThemedText style={styles.streakText}>
                    {member.streakCount} Day Streak
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.noStreakText}>No streak yet</ThemedText>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  memberCard: {
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
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.circular.large,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '500',
  },
  noStreakText: {
    fontSize: 14,
    opacity: 0.5,
  },
});

