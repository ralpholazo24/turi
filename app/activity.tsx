import { MemberAvatar } from '@/components/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { GroupActivity } from '@/types';
import { getColorsFromPreset } from '@/utils/group-colors';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor(
    { light: '#FFFFFF', dark: '#1F1F1F' },
    'background'
  );
  const subtleBackground = useThemeColor(
    { light: '#F8F9FA', dark: '#1A1A1A' },
    'background'
  );
  
  // Theme-aware colors for activity types
  const completedColor = useThemeColor(
    { light: '#10B981', dark: '#34D399' },
    'tint'
  );
  const skippedColor = useThemeColor(
    { light: '#F97316', dark: '#FB923C' },
    'tint'
  );
  const createdColor = useThemeColor(
    { light: '#3B82F6', dark: '#60A5FA' },
    'tint'
  );
  const dangerColor = useThemeColor(
    { light: '#EF4444', dark: '#F87171' },
    'tint'
  );
  const purpleColor = useThemeColor(
    { light: '#8B5CF6', dark: '#A78BFA' },
    'tint'
  );

  const BackIcon = APP_ICONS.back;

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

        // Type guard to check if metadata has task properties
        const hasTaskMetadata = 
          activity.type === 'task_completed' ||
          activity.type === 'task_skipped' ||
          activity.type === 'task_created' ||
          activity.type === 'task_deleted' ||
          activity.type === 'task_undone';
        
        const taskMetadata = hasTaskMetadata && activity.metadata 
          ? activity.metadata as { taskName: string; taskIcon: string }
          : null;

        items.push({
          id: activity.id,
          type: activity.type,
          groupId: group.id,
          groupName: group.name,
          groupIcon: group.icon,
          groupColorStart: getColorsFromPreset(group.colorPreset).start,
          groupColorEnd: getColorsFromPreset(group.colorPreset).end,
          taskId: task?.id,
          taskName: taskMetadata?.taskName || task?.name,
          taskIcon: taskMetadata?.taskIcon || task?.icon,
          memberId: member?.id || activity.actorId,
          memberName: activity.metadata && 'memberName' in activity.metadata 
            ? activity.metadata.memberName 
            : member?.name,
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
    if (filter === 'completed') return activityItems.filter((item) => 
      item.type === 'task_completed' || item.type === 'task_undone'
    );
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
      case 'task_undone':
        return t('activity.taskUndone', { name: memberName, taskName });
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

  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 375;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor + '20', backgroundColor }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} i18nKey="activity.title" />
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { borderBottomColor: borderColor + '20', backgroundColor }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          bounces={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === 'all' ? iconColor + '15' : 'transparent',
              },
            ]}
            onPress={() => setFilter('all')}
            activeOpacity={0.6}>
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'all' && styles.filterTextActive,
                  { color: filter === 'all' ? textColor : iconColor },
                ]}
                i18nKey="activity.all"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === 'completed' ? completedColor + '15' : 'transparent',
              },
            ]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.6}>
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'completed' && styles.filterTextActive,
                  { color: filter === 'completed' ? completedColor : iconColor },
                ]}
                i18nKey="activity.done"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === 'skipped' ? skippedColor + '15' : 'transparent',
              },
            ]}
            onPress={() => setFilter('skipped')}
            activeOpacity={0.6}>
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'skipped' && styles.filterTextActive,
                  { color: filter === 'skipped' ? skippedColor : iconColor },
                ]}
                i18nKey="activity.skipped"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === 'created' ? createdColor + '15' : 'transparent',
              },
            ]}
            onPress={() => setFilter('created')}
            activeOpacity={0.6}>
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'created' && styles.filterTextActive,
                  { color: filter === 'created' ? createdColor : iconColor },
                ]}
                i18nKey="activity.created"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === 'member' ? purpleColor + '15' : 'transparent',
              },
            ]}
            onPress={() => setFilter('member')}
            activeOpacity={0.6}>
              <ThemedText
                style={[
                  styles.filterText,
                  filter === 'member' && styles.filterTextActive,
                  { color: filter === 'member' ? purpleColor : iconColor },
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
          <View style={[styles.emptyContainer, { backgroundColor: subtleBackground }]}>
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
              <ThemedText style={[styles.dateHeader, { color: iconColor }]}>{dateKey}</ThemedText>
              {items.map((item) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.activityItem,
                      { 
                        backgroundColor: cardBackground, 
                        borderColor: borderColor + '20',
                      },
                      !item.taskId && item.type !== 'group_created' && styles.activityItemNoPress,
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={item.taskId || item.type === 'group_created' ? 0.7 : 1}>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <ThemedText style={[styles.activityTitle, { color: textColor }]}>
                          {getActivityMessage(item)}
                        </ThemedText>
                      </View>
                      <View style={styles.activityMeta}>
                        <ThemedText style={[styles.groupName, { color: item.groupColorStart }]}>
                          {item.groupName}
                        </ThemedText>
                        <ThemedText style={[styles.timeText, { color: iconColor }]}>
                          {formatTimeAgo(item.date, t)}
                        </ThemedText>
                      </View>
                    </View>
                    {item.memberId && item.memberAvatarColor && (
                      <View style={styles.avatarContainer}>
                        <MemberAvatar
                          member={{
                            id: item.memberId,
                            name: item.memberName || 'Unknown',
                            avatarColor: item.memberAvatarColor,
                          }}
                          size={isSmallScreen ? 36 : 40}
                        />
                      </View>
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
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  filterContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.medium,
    marginRight: 8,
    minHeight: 36,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  filterTextActive: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.xlarge,
    marginTop: 20,
  },
  emptyTitle: {
    marginBottom: 12,
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.65,
    fontSize: 15,
    lineHeight: 22,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    opacity: 0.6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  activityItemNoPress: {
    opacity: 0.85,
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  activityHeader: {
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  groupName: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
  },
  avatarContainer: {
    marginLeft: 8,
  },
});
