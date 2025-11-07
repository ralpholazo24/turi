import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { useUserStore } from '@/store/use-user-store';
import { Group, Member } from '@/types';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
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
  drag?: () => void;
  isActive?: boolean;
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
  drag,
  isActive,
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

  // Long press gesture for drag
  const longPressGesture = drag
    ? Gesture.LongPress()
        .minDuration(400)
        .onStart(() => {
          if (drag) {
            runOnJS(drag)();
          }
        })
    : undefined;

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
    .activeOffsetX([-10, 10]) // Require minimum horizontal movement
    .failOffsetY([-10, 10]); // Fail if vertical movement is too large

  // Compose gestures - allow both long press (for drag) and pan (for swipe)
  const composedGesture = longPressGesture
    ? Gesture.Simultaneous(longPressGesture, panGesture)
    : panGesture;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: isActive ? 0.8 : 1,
  }));

  const actionButtonsStyle = useAnimatedStyle(() => {
    // Hide action buttons when dragging (isActive) or when card is not swiped
    const shouldShow = !isActive && translateX.value < -10;
    return {
      opacity: shouldShow ? 1 : 0,
    };
  });

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
      <Animated.View style={[styles.actionButtonsContainer, { width: actionWidth }, actionButtonsStyle]}>
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
      </Animated.View>

      {/* Member Card (on top) */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.cardWrapper,
            isActive && styles.activeCard,
          ]}>
          <Animated.View
            style={[
              styles.memberCard,
              { backgroundColor, borderColor: borderColor + '80' },
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function MemberChipList({ group }: MemberChipListProps) {
  const { t } = useTranslation();
  const { deleteMember, reorderMembers } = useAppStore();
  const { user } = useUserStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  
  // Check if a member is the owner
  const isOwner = useCallback(
    (member: Member): boolean => {
      return !!(user && member.id === user.id && group.ownerId === user.id);
    },
    [user, group.ownerId]
  );

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const handleEdit = useCallback((member: Member) => {
    setSelectedMember(member);
    setIsEditModalVisible(true);
  }, []);

  const handleDelete = useCallback((member: Member) => {
    setSelectedMember(member);
    setIsDeleteConfirmationVisible(true);
  }, []);

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

  const handleReorderMembers = useCallback(
    async (memberIds: string[]) => {
      await reorderMembers(group.id, memberIds);
    },
    [group.id, reorderMembers]
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Member[] }) => {
      const memberIds = data.map((member) => member.id);
      handleReorderMembers(memberIds);
    },
    [handleReorderMembers]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Member>) => {
      return (
        <ScaleDecorator>
          <SwipeableMemberCard
            member={item}
            group={group}
            isOwner={isOwner(item)}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderColor={borderColor}
            onEdit={handleEdit}
            onDelete={handleDelete}
            drag={drag}
            isActive={isActive}
          />
        </ScaleDecorator>
      );
    },
    [group, backgroundColor, textColor, borderColor, handleEdit, handleDelete, isOwner]
  );

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
        <DraggableFlatList
          data={group.members}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          activationDistance={10}
          scrollEnabled={false}
        />
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
    flex: 1,
  },
  listContent: {
    gap: 12,
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
    position: 'relative',
    width: '100%',
    padding: 3, // Add padding to allow borders to show when scaled during drag
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 3,
    top: 3,
    bottom: 3,
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
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
  cardWrapper: {
    backgroundColor: 'transparent',
    zIndex: 1,
    width: '100%',
    position: 'relative',
  },
  activeCard: {
    zIndex: 10,
    elevation: 8,
  },
  memberCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: 18,
    borderWidth: 2,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  ownerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.medium,
    marginLeft: 12,
    borderWidth: 1.5,
  },
  ownerChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
