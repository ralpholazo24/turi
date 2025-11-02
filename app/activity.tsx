import { MemberAvatar } from '@/components/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { GroupActivity } from '@/types';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ActivityItem {
  id: string;
  type: GroupActivity['type'];
  groupId: string;
  groupName: string;
  groupIcon: string;
  groupColorStart: string;
  groupColorEnd: string;
  taskId?: string;
  taskName?: string;
  taskIcon?: string;
  memberId?: string;
  memberName?: string;
  memberAvatarColor?: string;
  timestamp: string;
  date: Date;
}

function getRelativeDateKey(date: Date, t: (key: string) => string): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) {
    return t('common.today');
  } else if (itemDate.getTime() === yesterday.getTime()) {
    return t('common.yesterday');
  } else if (itemDate >= weekAgo) {
    return t('activity.thisWeek');
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

function formatTimeAgo(date: Date, t: (key: string, options?: any) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('activity.justNow');
  if (diffMins < 60) return t('activity.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('activity.hoursAgo', { count: diffHours });
  if (diffDays === 1) return t('common.yesterday');
  if (diffDays < 7) return t('activity.daysAgo', { count: diffDays });
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ActivityScreen() {
  const { t } = useTranslation();
  const { groups } = useAppStore();
  const [filter, setFilter] = useState<
    'all' | 'completed' | 'skipped' | 'created' | 'member'
  >('all');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const iconColor = useThemeColor({}, 'icon');

  const BackIcon = APP_ICONS.back;
  const CheckIcon = APP_ICONS.check;
  const SkipForwardIcon = LucideIcons.SkipForward;
  const PlusIcon = LucideIcons.Plus;
  const TrashIcon = LucideIcons.Trash2;
  const UserPlusIcon = LucideIcons.UserPlus;
  const UserMinusIcon = LucideIcons.UserMinus;
  const UsersIcon = LucideIcons.Users;

  // Collect all activity items from all groups
  const activityItems = useMemo(() => {
    const items: ActivityItem[] = [];

    groups.forEach((group) => {
      (group.activities || []).forEach((activity: GroupActivity) => {
        const task = activity.targetId
          ? group.tasks.find((t) => t.id === activity.targetId)
          : undefined;
        const member =
          activity.actorId || activity.targetId
            ? group.members.find(
                (m) =>
                  m.id === activity.actorId || m.id === activity.targetId
              )
            : undefined;

        items.push({
          id: activity.id,
          type: activity.type,
          groupId: group.id,
          groupName: group.name,
          groupIcon: group.icon,
          groupColorStart: group.colorStart,
          groupColorEnd: group.colorEnd,
          taskId: task?.id,
          taskName: activity.metadata?.taskName || task?.name,
          taskIcon: activity.metadata?.taskIcon || task?.icon,
          memberId: member?.id || activity.actorId,
          memberName: activity.metadata?.memberName || member?.name,
          memberAvatarColor: member?.avatarColor,
          timestamp: activity.timestamp,
          date: new Date(activity.timestamp),
        });
      });
    });

    // Sort by date (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [groups]);

  // Filter items based on selected filter
  const filteredItems = useMemo(() => {
    if (filter === 'all') return activityItems;
    if (filter === 'completed') return activityItems.filter((item) => item.type === 'task_completed');
    if (filter === 'skipped') return activityItems.filter((item) => item.type === 'task_skipped');
    if (filter === 'created')
      return activityItems.filter((item) => 
        item.type === 'task_created' || item.type === 'group_created'
      );
    if (filter === 'member')
      return activityItems.filter((item) => 
        item.type === 'member_added' || item.type === 'member_deleted'
      );
    return activityItems;
  }, [activityItems, filter]);

  // Group items by relative date
  const groupedByDate = useMemo(() => {
    const grouped: { [key: string]: ActivityItem[] } = {};

    filteredItems.forEach((item) => {
      const dateKey = getRelativeDateKey(item.date, t);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [filteredItems, t]);

  const getActivityIcon = (type: GroupActivity['type']) => {
    switch (type) {
      case 'task_completed':
        return CheckIcon;
      case 'task_skipped':
        return SkipForwardIcon;
      case 'task_created':
        return PlusIcon;
      case 'task_deleted':
        return TrashIcon;
      case 'member_added':
        return UserPlusIcon;
      case 'member_deleted':
        return UserMinusIcon;
      case 'group_created':
        return UsersIcon;
      default:
        return CheckIcon;
    }
  };

  const getActivityIconColor = (type: GroupActivity['type']) => {
    switch (type) {
      case 'task_completed':
        return '#10B981';
      case 'task_skipped':
        return '#F97316';
      case 'task_created':
        return '#3B82F6';
      case 'task_deleted':
        return '#EF4444';
      case 'member_added':
        return '#10B981';
      case 'member_deleted':
        return '#EF4444';
      case 'group_created':
        return '#8B5CF6';
      default:
        return iconColor;
    }
  };

  const getActivityMessage = (item: ActivityItem): string => {
    const memberName = item.memberName || t('activity.someone');
    const taskName = item.taskName || 'task';
    
    switch (item.type) {
      case 'task_completed':
        return t('activity.taskCompleted', { name: memberName, taskName });
      case 'task_skipped':
        return t('activity.taskSkipped', { name: memberName, taskName });
      case 'task_created':
        return t('activity.addedTask', { taskName });
      case 'task_deleted':
        return t('activity.deletedTask', { taskName });
      case 'member_added':
        return t('activity.addedMember', { name: memberName });
      case 'member_deleted':
        return t('activity.removedMember', { name: memberName });
      case 'group_created':
        return t('activity.createdGroup', { name: item.groupName });
      default:
        return t('activity.title');
    }
  };

  const handleItemPress = (item: ActivityItem) => {
    if (item.taskId) {
      router.push(`/group/${item.groupId}/task/${item.taskId}`);
    } else if (item.type === 'group_created') {
      router.push(`/group/${item.groupId}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="activity.title" />
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { borderBottomColor: borderColor + '30' }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          bounces={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && { backgroundColor: iconColor + '20' },
            ]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}>
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'all' && styles.filterTextActive,
                  filter === 'all' && { color: iconColor },
                ]}
                i18nKey="activity.all"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'completed' && { backgroundColor: '#10B981' + '20' },
            ]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.7}>
            <CheckIcon size={12} color={filter === 'completed' ? '#10B981' : iconColor} />
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'completed' && styles.filterTextActive,
                  filter === 'completed' && { color: '#10B981' },
                ]}
                i18nKey="activity.done"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'skipped' && { backgroundColor: '#F97316' + '20' },
            ]}
            onPress={() => setFilter('skipped')}
            activeOpacity={0.7}>
            <SkipForwardIcon size={12} color={filter === 'skipped' ? '#F97316' : iconColor} />
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'skipped' && styles.filterTextActive,
                  filter === 'skipped' && { color: '#F97316' },
                ]}
                i18nKey="activity.skipped"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'created' && { backgroundColor: '#3B82F6' + '20' },
            ]}
            onPress={() => setFilter('created')}
            activeOpacity={0.7}>
            <PlusIcon size={12} color={filter === 'created' ? '#3B82F6' : iconColor} />
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'created' && styles.filterTextActive,
                  filter === 'created' && { color: '#3B82F6' },
                ]}
                i18nKey="activity.created"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'member' && { backgroundColor: '#10B981' + '20' },
            ]}
            onPress={() => setFilter('member')}
            activeOpacity={0.7}>
            <UsersIcon size={12} color={filter === 'member' ? '#10B981' : iconColor} />
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'member' && styles.filterTextActive,
                  filter === 'member' && { color: '#10B981' },
                ]}
                i18nKey="activity.members"
              />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyTitle} i18nKey="activity.noActivity" />
            <ThemedText style={styles.emptyText}>
              {filter === 'all'
                ? t('activity.noActivityDescription')
                : filter === 'completed'
                  ? t('activity.noCompletedTasks')
                  : filter === 'skipped'
                    ? t('activity.noSkippedTasks')
                    : filter === 'created'
                      ? t('activity.noCreatedItems')
                      : t('activity.noMemberChanges')}
            </ThemedText>
          </View>
        ) : (
          Object.entries(groupedByDate).map(([dateKey, items]) => (
            <View key={dateKey} style={styles.dateSection}>
              <ThemedText style={styles.dateHeader}>{dateKey}</ThemedText>
              {items.map((item) => {
                const ActivityIcon = getActivityIcon(item.type);
                const iconColor = getActivityIconColor(item.type);
                // eslint-disable-next-line import/namespace
                const TaskIconComponent =
                  item.taskIcon && LucideIcons[item.taskIcon as keyof typeof LucideIcons]
                    ? (LucideIcons[item.taskIcon as keyof typeof LucideIcons] as React.ComponentType<{
                        size?: number;
                        color?: string;
                      }>)
                    : undefined;
                // eslint-disable-next-line import/namespace
                const GroupIconComponent = LucideIcons[
                  item.groupIcon as keyof typeof LucideIcons
                ] as React.ComponentType<{ size?: number; color?: string }> | undefined;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.activityItem,
                      { backgroundColor, borderColor: borderColor + '30' },
                      !item.taskId && item.type !== 'group_created' && styles.activityItemNoPress,
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={item.taskId || item.type === 'group_created' ? 0.7 : 1}>
                    <View style={styles.activityLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: iconColor + '20',
                          },
                        ]}>
                        <ActivityIcon size={20} color={iconColor} />
                      </View>
                      <View style={styles.activityContent}>
                        <View style={styles.activityHeader}>
                          <ThemedText style={styles.activityTitle}>
                            {getActivityMessage(item)}
                          </ThemedText>
                        </View>
                        <View style={styles.activityMeta}>
                          <View style={styles.groupBadge}>
                            {item.taskId && TaskIconComponent ? (
                              <TaskIconComponent size={12} color={item.groupColorStart} />
                            ) : GroupIconComponent ? (
                              <GroupIconComponent size={12} color={item.groupColorStart} />
                            ) : null}
                            <ThemedText style={[styles.groupName, { color: item.groupColorStart }]}>
                              {item.groupName}
                            </ThemedText>
                          </View>
                          <ThemedText style={styles.timeText}>{formatTimeAgo(item.date, t)}</ThemedText>
                        </View>
                      </View>
                    </View>
                    {item.memberId && item.memberAvatarColor && (
                      <MemberAvatar
                        member={{
                          id: item.memberId,
                          name: item.memberName || 'Unknown',
                          avatarColor: item.memberAvatarColor,
                          icon: '',
                        }}
                        size={40}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  filterContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 6,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.large,
    gap: 4,
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  dateSection: {
    marginBottom: 32,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  activityItemNoPress: {
    opacity: 0.9,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupName: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
