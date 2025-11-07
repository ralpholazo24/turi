import { ConfirmationModal } from '@/components/confirmation-modal';
import { GroupModal } from '@/components/group-modal';
import { SwipeableGroupCard } from '@/components/swipeable-group-card';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { useUserStore } from '@/store/use-user-store';
import { Group } from '@/types';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { groups, isLoading, initialize, reorderGroups, deleteGroup } = useAppStore();
  const { user } = useUserStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const PlusIcon = APP_ICONS.add;

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAddGroup = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleEditGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setIsEditModalVisible(true);
  }, []);

  const handleDeleteGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setIsDeleteConfirmationVisible(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (selectedGroup) {
      await deleteGroup(selectedGroup.id);
      setSelectedGroup(null);
    }
    setIsDeleteConfirmationVisible(false);
  };

  const handleDragEnd = useCallback(
    async ({ data }: { data: Group[] }) => {
      const groupIds = data.map((group) => group.id);
      await reorderGroups(groupIds);
    },
    [reorderGroups]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Group>) => {
      return (
        <SwipeableGroupCard
          group={item}
          onEdit={handleEditGroup}
          onDelete={handleDeleteGroup}
          drag={drag}
          isActive={isActive}
        />
      );
    },
    [handleEditGroup, handleDeleteGroup]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} i18nKey="home.groups" />
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
          activeOpacity={0.7}>
          <LucideIcons.Settings size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ThemedText i18nKey="common.loading" />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/illustrations/chill-girl.svg')}
            style={styles.emptyIllustration}
            contentFit="contain"
            tintColor={iconColor}
          />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {user 
              ? t('home.noGroupsPersonalized', { name: user.name })
              : t('home.noGroups')}
          </ThemedText>
          <ThemedText style={styles.emptyText} i18nKey="home.noGroupsDescription" />
        </View>
      ) : (
        <DraggableFlatList
          data={groups}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          activationDistance={10}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 20 + insets.bottom, backgroundColor: buttonBackgroundColor }]}
        onPress={handleAddGroup}
        activeOpacity={0.8}>
        <PlusIcon size={32} color={buttonTextColor} />
      </TouchableOpacity>

      {/* Add Group Modal */}
      <GroupModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />

      {/* Edit Group Modal */}
      {selectedGroup && (
        <GroupModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={isDeleteConfirmationVisible}
        title={t('confirmation.deleteGroupTitle')}
        message={t('confirmation.deleteGroupMessage', { name: selectedGroup?.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmColor="#EF4444"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteConfirmationVisible(false);
          setSelectedGroup(null);
        }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.circular.large,
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
