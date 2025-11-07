import { BORDER_RADIUS } from '@/constants/border-radius';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Member } from '@/types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import Animated, {
  runOnJS,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { MemberAvatar } from './member-avatar';
import { ThemedText } from './themed-text';

interface DraggableMembersListProps {
  members: Member[];
  currentAssignedIndex: number;
  onReorder: (memberIds: string[]) => void;
}

interface MemberItemProps {
  member: Member;
  isCurrent: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

function MemberItem({ 
  member, 
  isCurrent, 
  backgroundColor, 
  borderColor, 
  textColor,
  drag,
  isActive,
}: MemberItemProps & { drag?: () => void; isActive?: boolean }) {
  const { t } = useTranslation();

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

  const cardStyle = useAnimatedStyle(() => ({
    opacity: isActive ? 0.8 : 1,
    transform: [{ scale: isActive ? 1.02 : 1 }],
  }));

  const content = (
    <View
      style={[
        styles.memberItem,
        { backgroundColor, borderColor: borderColor + '50' },
        isCurrent && styles.currentMemberItem,
      ]}>
      <MemberAvatar member={member} size={48} />
      <View style={styles.memberInfo}>
        <ThemedText style={[styles.memberName, isCurrent && { color: textColor, fontWeight: '600' }]}>
          {member.name}
        </ThemedText>
        {isCurrent && (
          <ThemedText style={styles.currentLabel} i18nKey="task.currentTurn" />
        )}
      </View>
    </View>
  );

  if (longPressGesture) {
    return (
      <GestureDetector gesture={longPressGesture}>
        <Animated.View style={cardStyle}>
          {content}
        </Animated.View>
      </GestureDetector>
    );
  }

  return <Animated.View style={cardStyle}>{content}</Animated.View>;
}

export function DraggableMembersList({
  members,
  currentAssignedIndex,
  onReorder,
}: DraggableMembersListProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Member[] }) => {
      const memberIds = data.map((member) => member.id);
      onReorder(memberIds);
    },
    [onReorder]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Member>) => {
      const itemIndex = members.findIndex((m) => m.id === item.id);
      const isCurrent = itemIndex === currentAssignedIndex;
      return (
        <ScaleDecorator>
          <MemberItem
            member={item}
            isCurrent={isCurrent}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            textColor={textColor}
            drag={drag}
            isActive={isActive}
          />
        </ScaleDecorator>
      );
    },
    [members, currentAssignedIndex, backgroundColor, borderColor, textColor]
  );

  if (members.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title} i18nKey="task.assignedMembers" />
      <DraggableFlatList
        data={members}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        activationDistance={10}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  listContent: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BORDER_RADIUS.large,
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
  currentMemberItem: {
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  currentLabel: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

