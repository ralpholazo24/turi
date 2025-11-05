import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { useUserStore } from '@/store/use-user-store';
import { Group, Member } from '@/types';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ConfirmationModal } from './confirmation-modal';
import { EditMemberModal } from './edit-member-modal';
import { MemberAvatar } from './member-avatar';
import { ThemedText } from './themed-text';

interface MemberChipListProps {
  group: Group;
}

interface SwipeableMemberCardProps {
  member: Member;
  group: Group;
  isOwner: boolean;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const ACTION_WIDTH = 160; // Width for both action buttons combined
const DELETE_ACTION_WIDTH = 80; // Width for delete button only

function SwipeableMemberCard({
  member,
  group,
  isOwner,
  backgroundColor,
  textColor,
  borderColor,
  onEdit,
  onDelete,
}: SwipeableMemberCardProps) {
  const { t } = useTranslation();
  const translateX = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const chipBackgroundColor = useThemeColor(
    { light: '#F5F5F5', dark: '#2A2A2A' },
    'background'
  );
  const chipTextColor = useThemeColor({}, 'text');

  const EditIcon = APP_ICONS.edit;
  const DeleteIcon = APP_ICONS.delete;

  // Calculate action width based on whether owner can edit
  const actionWidth = isOwner ? DELETE_ACTION_WIDTH : ACTION_WIDTH;

  const closeCard = () => {
    setIsOpen(false);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow swiping left (negative values)
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -actionWidth);
      } else if (translateX.value < 0) {
        // Allow swiping back to close
        translateX.value = Math.min(e.translationX + translateX.value, 0);
      }
    })
    .onEnd((e) => {
      // If swiped more than half the action width, open
      if (translateX.value < -actionWidth / 2) {
        translateX.value = withSpring(-actionWidth, {
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
      <View style={[styles.actionButtonsContainer, { width: actionWidth }]}>
        {!isOwner && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
            activeOpacity={0.8}>
            <EditIcon size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
          </TouchableOpacity>
        )}
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
              <ThemedText style={styles.memberName}>
                {isOwner ? t('member.you') : member.name}
              </ThemedText>
            </View>

            {/* Owner Chip - Right side */}
            {isOwner && (
              <View style={[styles.ownerChip, { 
                backgroundColor: chipBackgroundColor, 
                borderColor: borderColor 
              }]}>
                <ThemedText style={[styles.ownerChipText, { color: chipTextColor }]}>
                  {t('member.owner')}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function MemberChipList({ group }: MemberChipListProps) {
  const { t } = useTranslation();
  const { deleteMember } = useAppStore();
  const { user } = useUserStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  
  // Check if a member is the owner
  const isOwner = (member: Member) => {
    return user && member.id === user.id && group.ownerId === user.id;
  };

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

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
        <Image
          source={require('@/assets/illustrations/boy-sipping.svg')}
          style={styles.emptyIllustration}
          contentFit="contain"
          tintColor={iconColor}
        />
        <ThemedText type="subtitle" style={styles.emptyTitle} i18nKey="group.noMembers" />
        <ThemedText style={styles.emptyText} i18nKey="group.noMembersDescription" />
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
            isOwner={isOwner(member)}
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
        title={t('confirmation.deleteMemberTitle')}
        message={t('confirmation.deleteMemberMessage', { name: selectedMember?.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
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
  emptyIllustration: {
    width: 280,
    height: 280,
    marginBottom: 24,
    opacity: 0.8,
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
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
  },
  ownerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.small,
    marginLeft: 12,
    borderWidth: 1,
  },
  ownerChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
