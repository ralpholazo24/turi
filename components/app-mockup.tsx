import { BORDER_RADIUS } from '@/constants/border-radius';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getColorsFromPreset } from '@/utils/group-colors';
import { getColorFromName, getInitials } from '@/utils/member-avatar';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';

type MockupType = 'home' | 'group' | 'tasks' | 'solo';

interface AppMockupProps {
  type: MockupType;
  style?: object;
  isVisible?: boolean;
}

export function AppMockup({ type, style, isVisible = true }: AppMockupProps) {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const renderHomeMockup = () => {
    const groupColors = getColorsFromPreset('Cyan-Blue');

    return (
      <View 
        style={[
          styles.mockupContainer, 
          { backgroundColor, borderColor }, 
          style
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>{t('mockup.groups')}</Text>
          <View style={[styles.settingsIcon, { backgroundColor: borderColor + '30' }]} />
        </View>
        
        {/* Group Cards */}
        <View style={styles.content}>
          <AnimatedGroupCard
            name={t('mockup.groupNames.home')}
            icon="Home"
            colorStart={groupColors.start}
            colorEnd={groupColors.end}
            taskCount={3}
            memberCount={2}
            nextTask={t('mockup.taskNames.washDishes')}
            assignedTo={t('mockup.memberNames.alice')}
            delay={200}
            isVisible={isVisible}
          />
          <AnimatedGroupCard
            name={t('mockup.groupNames.work')}
            icon="Briefcase"
            colorStart="#DC2626"
            colorEnd="#F97316"
            taskCount={2}
            memberCount={3}
            nextTask={t('mockup.taskNames.teamMeeting')}
            assignedTo={t('mockup.memberNames.bob')}
            delay={400}
            isVisible={isVisible}
          />
        </View>
        
        {/* FAB */}
        <View 
          style={[
            styles.fab, 
            { 
              backgroundColor: textColor,
            }
          ]}>
          <LucideIcons.Plus size={20} color={backgroundColor} />
        </View>
      </View>
    );
  };

  const renderGroupMockup = () => {
    return (
      <View 
        style={[
          styles.mockupContainer, 
          { backgroundColor, borderColor }, 
          style
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.backIcon, { backgroundColor: borderColor + '30' }]} />
          <View style={styles.headerContent}>
            <View style={[styles.groupIcon, { backgroundColor: borderColor + '30' }]}>
              <LucideIcons.Home size={16} color={textColor} />
            </View>
            <Text style={[styles.groupName, { color: textColor }]}>{t('mockup.groupNames.home')}</Text>
          </View>
          <View style={[styles.menuIcon, { backgroundColor: borderColor + '30' }]} />
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tabContainer, { backgroundColor: borderColor + '30' }]}>
            <View style={styles.tab}>
              <Text style={[styles.tabText, { color: textColor, opacity: 0.6 }]}>{t('mockup.tasks')}</Text>
            </View>
            <View style={[styles.tab, styles.tabActive, { backgroundColor }]}>
              <Text style={[styles.tabText, styles.tabTextActive, { color: textColor }]}>{t('mockup.members')}</Text>
            </View>
          </View>
        </View>
        
        {/* Members List */}
        <View style={styles.content}>
          <AnimatedMemberChip name={t('mockup.memberNames.alice')} avatarColor={getColorFromName(t('mockup.memberNames.alice'))} delay={200} isVisible={isVisible} />
          <AnimatedMemberChip name={t('mockup.memberNames.bob')} avatarColor={getColorFromName(t('mockup.memberNames.bob'))} delay={350} isVisible={isVisible} />
          <AnimatedMemberChip name={t('mockup.memberNames.charlie')} avatarColor={getColorFromName(t('mockup.memberNames.charlie'))} delay={500} isVisible={isVisible} />
        </View>
        
        {/* FAB */}
        <View 
          style={[
            styles.fab, 
            { 
              backgroundColor: textColor,
            }
          ]}>
          <LucideIcons.Plus size={20} color={backgroundColor} />
        </View>
      </View>
    );
  };

  const renderTasksMockup = () => {
    const groupColors = getColorsFromPreset('Cyan-Blue');
    const taskColors = getColorsFromPreset('Green-Mint');

    return (
      <View 
        style={[
          styles.mockupContainer, 
          { backgroundColor, borderColor }, 
          style
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.backIcon, { backgroundColor: borderColor + '30' }]} />
          <View style={styles.headerContent}>
            <View style={[styles.groupIcon, { backgroundColor: borderColor + '30' }]}>
              <LucideIcons.Home size={16} color={textColor} />
            </View>
            <Text style={[styles.groupName, { color: textColor }]}>{t('mockup.groupNames.home')}</Text>
          </View>
          <View style={[styles.menuIcon, { backgroundColor: borderColor + '30' }]} />
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tabContainer, { backgroundColor: borderColor + '30' }]}>
            <View style={[styles.tab, styles.tabActive, { backgroundColor }]}>
              <Text style={[styles.tabText, styles.tabTextActive, { color: textColor }]}>{t('mockup.tasks')}</Text>
            </View>
            <View style={styles.tab}>
              <Text style={[styles.tabText, { color: textColor, opacity: 0.6 }]}>{t('mockup.members')}</Text>
            </View>
          </View>
        </View>
        
        {/* Task Cards */}
        <View style={styles.content}>
          <AnimatedTaskCard
            name={t('mockup.taskNames.washDishes')}
            icon="Droplet"
            colorStart={taskColors.start}
            colorEnd={taskColors.end}
            assignedTo={t('mockup.memberNames.alice')}
            schedule={t('mockup.schedule.daily')}
            delay={200}
            isVisible={isVisible}
          />
          <AnimatedTaskCard
            name={t('mockup.taskNames.takeOutTrash')}
            icon="Trash2"
            colorStart={groupColors.start}
            colorEnd={groupColors.end}
            assignedTo={t('mockup.memberNames.bob')}
            schedule={t('mockup.schedule.weeklyMon')}
            delay={400}
            isVisible={isVisible}
          />
        </View>
        
        {/* FAB */}
        <View 
          style={[
            styles.fab, 
            { 
              backgroundColor: textColor,
            }
          ]}>
          <LucideIcons.Plus size={20} color={backgroundColor} />
        </View>
      </View>
    );
  };

  const renderSoloMockup = () => {
    const taskColors = getColorsFromPreset('Purple-Pink');
    const taskColors2 = getColorsFromPreset('Red-Orange');

    return (
      <View 
        style={[
          styles.mockupContainer, 
          { backgroundColor, borderColor }, 
          style
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.backIcon, { backgroundColor: borderColor + '30' }]} />
          <View style={styles.headerContent}>
            <View style={[styles.groupIcon, { backgroundColor: borderColor + '30' }]}>
              <LucideIcons.Dumbbell size={16} color={textColor} />
            </View>
            <Text style={[styles.groupName, { color: textColor }]}>{t('mockup.groupNames.fitness')}</Text>
          </View>
          <View style={[styles.menuIcon, { backgroundColor: borderColor + '30' }]} />
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tabContainer, { backgroundColor: borderColor + '30' }]}>
            <View style={[styles.tab, styles.tabActive, { backgroundColor }]}>
              <Text style={[styles.tabText, styles.tabTextActive, { color: textColor }]}>{t('mockup.tasks')}</Text>
            </View>
            <View style={styles.tab}>
              <Text style={[styles.tabText, { color: textColor, opacity: 0.6 }]}>{t('mockup.members')}</Text>
            </View>
          </View>
        </View>
        
        {/* Task Cards */}
        <View style={styles.content}>
          <AnimatedTaskCard
            name={t('mockup.taskNames.morningRun')}
            icon="Footprints"
            colorStart={taskColors.start}
            colorEnd={taskColors.end}
            assignedTo={t('mockup.you')}
            schedule={t('mockup.schedule.dailyTime')}
            isSolo={true}
            delay={200}
            isVisible={isVisible}
          />
          <AnimatedTaskCard
            name={t('mockup.taskNames.gymWorkout')}
            icon="Dumbbell"
            colorStart={taskColors2.start}
            colorEnd={taskColors2.end}
            assignedTo={t('mockup.you')}
            schedule={t('mockup.schedule.weekly')}
            isSolo={true}
            delay={400}
            isVisible={isVisible}
          />
        </View>
        
        {/* FAB */}
        <View 
          style={[
            styles.fab, 
            { 
              backgroundColor: textColor,
            }
          ]}>
          <LucideIcons.Plus size={20} color={backgroundColor} />
        </View>
      </View>
    );
  };

  switch (type) {
    case 'home':
      return renderHomeMockup();
    case 'group':
      return renderGroupMockup();
    case 'tasks':
      return renderTasksMockup();
    case 'solo':
      return renderSoloMockup();
    default:
      return null;
  }
}

interface MockupGroupCardProps {
  name: string;
  icon: string;
  colorStart: string;
  colorEnd: string;
  taskCount: number;
  memberCount: number;
  nextTask: string;
  assignedTo: string;
}

interface AnimatedGroupCardProps extends MockupGroupCardProps {
  delay?: number;
  isVisible?: boolean;
}

function AnimatedGroupCard(props: AnimatedGroupCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { isVisible, delay = 0 } = props;

  useEffect(() => {
    if (isVisible !== false) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, delay]);

  return (
    <Animated.View
      style={[
        styles.groupCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <MockupGroupCard {...props} />
    </Animated.View>
  );
}

function MockupGroupCard({
  name,
  icon,
  colorStart,
  colorEnd,
  taskCount,
  memberCount,
  nextTask,
  assignedTo,
}: MockupGroupCardProps) {
  const { t } = useTranslation();
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;

  return (
    <View style={styles.groupCardInner}>
      <LinearGradient
        colors={[colorStart, colorEnd]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.groupCardGradient}>
        {IconComponent && (
          <View style={styles.groupCardIcon}>
            <IconComponent size={60} color="rgba(255, 255, 255, 0.25)" />
          </View>
        )}
        <View style={styles.groupCardContent}>
          <Text style={styles.groupCardName}>{name}</Text>
          <View style={styles.groupCardInfo}>
            <Text style={styles.groupCardInfoText}>{t('mockup.tasksCount', { count: taskCount })}</Text>
            <Text style={styles.groupCardInfoText}>•</Text>
            <Text style={styles.groupCardInfoText}>{t('mockup.membersCount', { count: memberCount })}</Text>
          </View>
          <View style={styles.groupCardDivider} />
          <Text style={styles.groupCardTaskLabel}>{t('mockup.nextTask')}</Text>
          <Text style={styles.groupCardTaskName}>{nextTask}</Text>
          <Text style={styles.groupCardAssigned}>{t('mockup.assignedTo')} {assignedTo}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

interface MockupTaskCardProps {
  name: string;
  icon: string;
  colorStart: string;
  colorEnd: string;
  assignedTo: string;
  schedule: string;
  isSolo?: boolean;
}

interface AnimatedTaskCardProps extends MockupTaskCardProps {
  delay?: number;
  isVisible?: boolean;
}

function AnimatedTaskCard(props: AnimatedTaskCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { isVisible, delay = 0 } = props;

  useEffect(() => {
    if (isVisible !== false) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, delay]);

  return (
    <Animated.View
      style={[
        styles.taskCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <MockupTaskCard {...props} />
    </Animated.View>
  );
}

function MockupTaskCard({
  name,
  icon,
  colorStart,
  colorEnd,
  assignedTo,
  schedule,
  isSolo = false,
}: MockupTaskCardProps) {
  const { t } = useTranslation();
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }> | undefined;
  const youText = t('mockup.you');
  const avatarColor = isSolo ? getColorFromName(youText) : getColorFromName(assignedTo);
  const initials = isSolo ? getInitials(youText) : getInitials(assignedTo);

  return (
    <View style={styles.taskCardInner}>
      <LinearGradient
        colors={[colorStart, colorEnd]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.taskCardGradient}>
        {IconComponent && (
          <View style={styles.taskCardIcon}>
            <IconComponent size={50} color="rgba(255, 255, 255, 0.25)" />
          </View>
        )}
        <View style={styles.taskCardContent}>
          <Text style={styles.taskCardName}>{name}</Text>
          <View style={styles.taskCardSchedule}>
            <Text style={styles.taskCardScheduleText}>{schedule}</Text>
          </View>
          <View style={styles.taskCardBottom}>
            <View style={styles.taskCardAssigned}>
              <View style={[styles.taskCardAvatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.taskCardAvatarText}>{initials}</Text>
              </View>
              <Text style={styles.taskCardAssignedText}>{t('mockup.turn', { name: assignedTo })}</Text>
            </View>
            <View style={styles.taskCardBadge}>
              <Text style={styles.taskCardBadgeText}>{t('mockup.pending')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mockupContainer: {
    width: 280,
    height: 500,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginLeft: 12,
  },
  backIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  groupIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  menuIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginLeft: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.medium,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  },
  tabTextActive: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.circular.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCard: {
    marginBottom: 12,
  },
  groupCardInner: {
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
  },
  groupCardGradient: {
    padding: 12,
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
  },
  groupCardIcon: {
    position: 'absolute',
    right: -5,
    top: -5,
    opacity: 1,
  },
  groupCardContent: {
    zIndex: 1,
  },
  groupCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  groupCardInfo: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  groupCardInfoText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  groupCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  groupCardTaskLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.75,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  groupCardTaskName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  groupCardAssigned: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.75,
  },
  taskCard: {
    marginBottom: 10,
  },
  taskCardInner: {
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
  },
  taskCardGradient: {
    padding: 12,
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
  },
  taskCardIcon: {
    position: 'absolute',
    right: -5,
    top: -5,
    opacity: 1,
  },
  taskCardContent: {
    zIndex: 1,
  },
  taskCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  taskCardSchedule: {
    marginBottom: 10,
  },
  taskCardScheduleText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  taskCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardAssigned: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskCardAvatar: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circular.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  taskCardAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  taskCardAssignedText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  taskCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  taskCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  memberChip: {
    marginBottom: 8,
  },
  memberChipInner: {
    borderRadius: BORDER_RADIUS.xlarge,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
  },
  memberChipAvatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.circular.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberChipAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberChipName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

interface AnimatedMemberChipProps {
  name: string;
  avatarColor: string;
  delay?: number;
  isVisible?: boolean;
}

function AnimatedMemberChip({ name, avatarColor, delay = 0, isVisible = true }: AnimatedMemberChipProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const backgroundColor = useThemeColor({}, 'background');
  const initials = getInitials(name);

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, delay]);

  return (
    <Animated.View
      style={[
        styles.memberChip,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={[styles.memberChipInner, { backgroundColor, borderColor }]}>
        <View style={[styles.memberChipAvatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.memberChipAvatarText}>{initials}</Text>
        </View>
        <Text style={[styles.memberChipName, { color: textColor }]}>{name}</Text>
      </View>
    </Animated.View>
  );
}

