import { BORDER_RADIUS } from '@/constants/border-radius';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { useUserStore } from '@/store/use-user-store';
import { Group, Member } from '@/types';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { ConfirmationModal } from './confirmation-modal';
import { MemberModal } from './member-modal';
import { MemberAvatar } from './member-avatar';
import { SwipeableCard } from './swipeable-card';
import { ThemedText } from './themed-text';

interface MemberChipListProps {
  group: Group;
}

export function MemberChipList({ group }: MemberChipListProps) {
  const { t } = useTranslation();
  const { deleteMember, reorderMembers } = useAppStore();
  const { user } = useUserStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  
  // Check if a member is the owner
  const isOwner = useCallback(
    (member: Member): boolean => {
      return !!(user && member.id === user.id && group.ownerId === user.id);
    },
    [user, group.ownerId]
  );

  const backgroundColor = useThemeColor({}, 'background');
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

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    // Clear selectedMember after modal animation completes (300ms for slide animation)
    setTimeout(() => {
      setSelectedMember(null);
    }, 300);
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

  const handleSwipeStart = useCallback((memberId: string) => {
    // Close any other open card when a new swipe starts
    if (openCardId && openCardId !== memberId) {
      setOpenCardId(null);
    }
    // Set this card as the one being swiped
    setOpenCardId(memberId);
  }, [openCardId]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Member>) => {
      const memberIsOwner = isOwner(item);
      const isCardOpen = openCardId === item.id;

      return (
        <SwipeableCard
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
          hideEditButton={false}
          drag={drag}
          isActive={isActive}
          isOpen={isCardOpen}
          onSwipeStart={() => handleSwipeStart(item.id)}
          onSwipeClose={() => setOpenCardId(null)}
          containerStyle={styles.swipeableContainer}>
          <View style={[styles.memberCard, { backgroundColor, borderColor }]}>
            <MemberAvatar member={item} size={40} />
            <View style={styles.memberInfo}>
              <ThemedText style={styles.memberName}>
                {memberIsOwner ? t('member.you') : item.name}
              </ThemedText>
            </View>
          </View>
        </SwipeableCard>
      );
    },
    [backgroundColor, borderColor, handleEdit, handleDelete, isOwner, openCardId, handleSwipeStart, t]
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
        <MemberModal
          visible={isEditModalVisible}
          onClose={handleCloseEditModal}
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
    marginBottom: 8,
  },
  memberCard: {
    borderRadius: BORDER_RADIUS.xlarge,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
