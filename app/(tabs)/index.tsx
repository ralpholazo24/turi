import { AddGroupModal } from '@/components/add-group-modal';
import { GroupCard } from '@/components/group-card';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { groups, isLoading, initialize } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const handleAddGroup = () => {
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
              source={require('@/assets/illustrations/man-fishing.svg')}
              style={styles.emptyIllustration}
              contentFit="contain"
              tintColor={iconColor}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle} i18nKey="home.noGroups" />
            <ThemedText style={styles.emptyText} i18nKey="home.noGroupsDescription" />
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 20 + insets.bottom, backgroundColor: buttonBackgroundColor }]}
        onPress={handleAddGroup}
        activeOpacity={0.8}>
        <PlusIcon size={32} color={buttonTextColor} />
      </TouchableOpacity>

      {/* Add Group Modal */}
      <AddGroupModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  groupsContainer: {
    gap: 16,
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
