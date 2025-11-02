import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Group, Member } from '@/types';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { MemberAvatar } from './member-avatar';
import { EditMemberModal } from './edit-member-modal';
import { ConfirmationModal } from './confirmation-modal';
import { useAppStore } from '@/store/use-app-store';

interface MemberChipListProps {
  group: Group;
}

interface SwipeableMemberCardProps {
  member: Member;
  group: Group;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const ACTION_WIDTH = 160; // Width for both action buttons combined

function SwipeableMemberCard({
  member,
  group,
  backgroundColor,
  textColor,
  borderColor,
  onEdit,
  onDelete,
}: SwipeableMemberCardProps) {
  const translateX = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const EditIcon = APP_ICONS.edit;
  const DeleteIcon = APP_ICONS.delete;
  const FlameIcon = APP_ICONS.flame;

  const closeCard = () => {
    setIsOpen(false);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow swiping left (negative values)
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -ACTION_WIDTH);
      } else if (translateX.value < 0) {
        // Allow swiping back to close
        translateX.value = Math.min(e.translationX + translateX.value, 0);
      }
    })
    .onEnd((e) => {
      // If swiped more than half the action width, open
      if (translateX.value < -ACTION_WIDTH / 2) {
        translateX.value = withSpring(-ACTION_WIDTH, {
          damping: 20,
          stiffness: 300,
        });
        runOnJS(setIsOpen)(true);
      } else {
        // Otherwise, close
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        runOnJS(closeCard)();
      }
    })
    .activeOffsetX([-10, 10]); // Require minimum horizontal movement

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleEdit = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    setIsOpen(false);
    onEdit(member);
  };

  const handleDelete = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    setIsOpen(false);
    onDelete(member);
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Action Buttons (behind the card) */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.8}>
          <EditIcon size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}>
          <DeleteIcon size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Member Card (on top) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.memberCard,
            { backgroundColor, borderColor: borderColor + '50' },
            cardStyle,
          ]}>
          <View style={styles.memberContent}>
            {/* Avatar */}
            <MemberAvatar member={member} size={56} />

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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function MemberChipList({ group }: MemberChipListProps) {
  const { deleteMember } = useAppStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const UsersIcon = APP_ICONS.users;

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalVisible(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteConfirmationVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedMember) {
      await deleteMember(group.id, selectedMember.id);
      setSelectedMember(null);
    }
    setIsDeleteConfirmationVisible(false);
  };

  const handleCloseModals = () => {
    setIsEditModalVisible(false);
    setIsDeleteConfirmationVisible(false);
    setSelectedMember(null);
  };

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
    <>
      <View style={styles.container}>
        {group.members.map((member) => (
          <SwipeableMemberCard
            key={member.id}
            member={member}
            group={group}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderColor={borderColor}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </View>

      {/* Edit Member Modal */}
      {selectedMember && (
        <EditMemberModal
          visible={isEditModalVisible}
          onClose={handleCloseModals}
          group={group}
          member={selectedMember}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={isDeleteConfirmationVisible}
        title="Delete Member"
        message={`Are you sure you want to delete ${selectedMember?.name}? This will remove them from all tasks and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#EF4444"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmationVisible(false)}
      />
    </>
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
  swipeableContainer: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.large,
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: ACTION_WIDTH,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  memberCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
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
