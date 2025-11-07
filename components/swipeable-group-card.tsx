import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { Group } from '@/types';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { GroupCard } from './group-card';
import { ThemedText } from './themed-text';

interface SwipeableGroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  drag?: () => void;
  isActive?: boolean;
}

const ACTION_WIDTH = 160; // Width for both action buttons combined

export function SwipeableGroupCard({
  group,
  onEdit,
  onDelete,
  drag,
  isActive,
}: SwipeableGroupCardProps) {
  const translateX = useSharedValue(0);

  const EditIcon = APP_ICONS.edit;
  const DeleteIcon = APP_ICONS.delete;

  // Long press gesture for drag (if drag function provided)
  const longPressGesture = drag
    ? Gesture.LongPress()
        .minDuration(400)
        .onStart(() => {
          if (drag) {
            runOnJS(drag)();
          }
        })
    : undefined;

  // Swipe gesture for actions (only horizontal swipes)
  // This should not interfere with long press drag
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow swiping left (negative values) and prioritize horizontal movement
      // If vertical movement is greater, don't interfere (let drag handle it)
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        if (e.translationX < 0) {
          translateX.value = Math.max(e.translationX, -ACTION_WIDTH);
        } else if (translateX.value < 0) {
          // Allow swiping back to close
          translateX.value = Math.min(e.translationX + translateX.value, 0);
        }
      }
    })
    .onEnd((e) => {
      // If swiped more than half the action width, open
      if (translateX.value < -ACTION_WIDTH / 2) {
        translateX.value = withSpring(-ACTION_WIDTH, {
          damping: 20,
          stiffness: 300,
        });
      } else {
        // Otherwise, close
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    })
    .activeOffsetX([-20, 20]) // Require significant horizontal movement to activate
    .failOffsetY([-10, 10]) // Fail quickly on vertical movement (allows drag to work)
    .minPointers(1)
    .maxPointers(1);

  // Compose gestures: allow both long press and swipe to work
  const composedGesture = longPressGesture
    ? Gesture.Simultaneous(longPressGesture, panGesture)
    : panGesture;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animate action buttons opacity based on swipe position
  const actionButtonsStyle = useAnimatedStyle(() => {
    // Calculate opacity based on swipe distance
    // Fully visible when swiped at least 20px, fade in smoothly
    const swipeDistance = Math.abs(translateX.value);
    const opacity = Math.min(swipeDistance / 20, 1);
    return {
      opacity: translateX.value < 0 ? opacity : 0,
    };
  });

  const handleEdit = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    onEdit(group);
  };

  const handleDelete = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    onDelete(group);
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Action Buttons (behind the card) */}
      <Animated.View style={[styles.actionButtonsContainer, { width: ACTION_WIDTH }, actionButtonsStyle]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.8}>
          <EditIcon size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText} i18nKey="common.edit" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}>
          <DeleteIcon size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText} i18nKey="common.delete" />
        </TouchableOpacity>
      </Animated.View>

      {/* Group Card (on top) */}
      <Animated.View style={[cardStyle, styles.cardWrapper, isActive && styles.activeCard]}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.gestureArea}>
            <GroupCard 
              group={group} 
              containerStyle={styles.groupCardOverride}
            />
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.xlarge,
    position: 'relative',
    width: '100%',
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 0,
    borderRadius: BORDER_RADIUS.xlarge,
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
    overflow: 'hidden',
  },
  groupCardOverride: {
    marginBottom: 0, // Remove margin since swipeableContainer handles spacing
  },
  activeCard: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  gestureArea: {
    width: '100%',
  },
});

