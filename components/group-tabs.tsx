import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';

type TabType = 'tasks' | 'members';

interface GroupTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function GroupTabs({ activeTab, onTabChange }: GroupTabsProps) {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  return (
    <View style={styles.container}>
      <View style={[styles.tabContainer, { backgroundColor: borderColor + '30' }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'tasks' && [styles.tabActive, { backgroundColor }],
          ]}
          onPress={() => onTabChange('tasks')}>
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'tasks' && styles.tabTextActive,
            ]}
            i18nKey="group.tasks"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'members' && [styles.tabActive, { backgroundColor }],
          ]}
          onPress={() => onTabChange('members')}>
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'members' && styles.tabTextActive,
            ]}
            i18nKey="group.members"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.medium,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.small,
    alignItems: 'center',
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  tabTextActive: {
    fontWeight: '600',
    opacity: 1,
  },
});

