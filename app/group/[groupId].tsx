import { AddMemberModal } from '@/components/add-member-modal';
import { AddTaskModal } from '@/components/add-task-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { EditGroupModal } from '@/components/edit-group-modal';
import { GroupContextMenu } from '@/components/group-context-menu';
import { GroupTabs } from '@/components/group-tabs';
import { MemberChipList } from '@/components/member-chip-list';
import { TaskCardList } from '@/components/task-card-list';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { router, useLocalSearchParams } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'tasks' | 'members';

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { groups, initialize, deleteGroup } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const BackIcon = APP_ICONS.back;
  const PlusIcon = APP_ICONS.add;
  const MenuIcon = APP_ICONS.menu;

  useEffect(() => {
    initialize();
  }, [initialize]);

  const group = groups.find((g) => g.id === groupId);

  const handleMenuPress = () => {
    setIsContextMenuVisible(true);
  };

  const handleEdit = () => {
    setIsContextMenuVisible(false);
    setIsEditModalVisible(true);
  };

  const handleDelete = () => {
    setIsContextMenuVisible(false);
    setIsDeleteConfirmationVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (group) {
      setIsDeleteConfirmationVisible(false);
      // Navigate immediately to avoid showing "not found" page
      router.back();
      // Delete group after navigation (Zustand store persists independently)
      await deleteGroup(group.id);
    } else {
      setIsDeleteConfirmationVisible(false);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalVisible(false);
    setIsDeleteConfirmationVisible(false);
    setIsContextMenuVisible(false);
  };

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ThemedText type="title">Group not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Get the icon component dynamically
  // eslint-disable-next-line import/namespace
  const IconComponent = LucideIcons[group.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <LucideIcons.ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            {IconComponent ? (
              <IconComponent size={24} color={textColor} />
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
          </View>
          <View style={styles.groupNameContainer}>
            <ThemedText type="subtitle" style={styles.groupName}>
              {group.name}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleMenuPress}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MenuIcon size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'tasks' ? (
          <TaskCardList 
            group={group} 
            onOpenAddMember={() => {
              setActiveTab('members');
              setIsAddMemberModalVisible(true);
            }}
          />
        ) : (
          <MemberChipList group={group} />
        )}
      </ScrollView>

      {/* Floating Action Button - Only show on Tasks tab and when group has members */}
      {activeTab === 'tasks' && group.members.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: 20 + insets.bottom }]}
          onPress={() => setIsAddTaskModalVisible(true)}
          activeOpacity={0.8}>
          <PlusIcon size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add Member Button - Only show on Members tab */}
      {activeTab === 'members' && (
        <TouchableOpacity
          style={[styles.fab, { bottom: 20 + insets.bottom }]}
          onPress={() => setIsAddMemberModalVisible(true)}
          activeOpacity={0.8}>
          <PlusIcon size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        visible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        group={group}
        onOpenAddMember={() => {
          setIsAddTaskModalVisible(false);
          setIsAddMemberModalVisible(true);
        }}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        visible={isAddMemberModalVisible}
        onClose={() => setIsAddMemberModalVisible(false)}
        group={group}
      />

      {/* Edit Group Modal */}
      {group && (
        <EditGroupModal
          visible={isEditModalVisible}
          onClose={handleCloseModals}
          group={group}
        />
      )}

      {/* Group Context Menu */}
      <GroupContextMenu
        visible={isContextMenuVisible}
        onClose={() => setIsContextMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={isDeleteConfirmationVisible}
        title="Delete Group"
        message={`Are you sure you want to delete "${group?.name}"? This will permanently delete all members, tasks, and data associated with this group. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#EF4444"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmationVisible(false)}
      />
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
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BORDER_RADIUS.small,
  },
  groupNameContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
  },
  soloBadge: {
    marginTop: 4,
  },
  soloBadgeText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  tabContent: {
    padding: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.circular.large,
    backgroundColor: '#10B981', // Green color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
