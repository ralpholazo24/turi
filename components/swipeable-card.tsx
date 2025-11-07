import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  drag?: () => void;
  isActive?: boolean;
  containerStyle?: object;
}

const ACTION_WIDTH = 160; // Width for both action buttons combined

export function SwipeableCard({
  children,
  onEdit,
  onDelete,
  drag,
  isActive,
  containerStyle,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const EditIcon = APP_ICONS.edit;
  const DeleteIcon = APP_ICONS.delete;

  // Long press gesture for drag (if drag function provided)
  // Following Apple guidelines: 400ms minimum for long press
  const longPressGesture = drag
    ? Gesture.LongPress()
        .minDuration(400)
        .onStart(() => {
          isDragging.value = true;
          // Reset swipe position when drag starts
          translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 300,
          });
          if (drag) {
            runOnJS(drag)();
          }
        })
        .onEnd(() => {
          // Reset dragging state when long press ends
          // The isActive prop will handle the actual drag state
          isDragging.value = false;
        })
    : undefined;

  // Swipe gesture for actions (only horizontal swipes)
  // Following Apple guidelines: 44pt minimum for gesture recognition
  // This gesture should NOT activate during drag operations
  const panGesture = Gesture.Pan()
    .enabled(!isActive) // Disable when dragging (isActive from DraggableFlatList)
    .onBegin(() => {
      // Early check: if dragging is active, don't process
      if (isActive || isDragging.value) {
        return;
      }
    })
    .onUpdate((e) => {
      // Don't process swipe if dragging is active
      // isActive comes from DraggableFlatList and indicates active drag
      if (isActive || isDragging.value) {
        return;
      }

      // Only allow swiping left (negative values) and require clear horizontal intent
      // Apple guideline: horizontal movement should be at least 1.5x vertical movement
      const horizontalMovement = Math.abs(e.translationX);
      const verticalMovement = Math.abs(e.translationY);
      
      // Early fail: if vertical movement is clearly dominant, don't process
      // This allows taps to pass through immediately
      if (verticalMovement > horizontalMovement * 1.2 && horizontalMovement < 20) {
        return;
      }
      
      if (horizontalMovement > verticalMovement * 1.5) {
        if (e.translationX < 0) {
          translateX.value = Math.max(e.translationX, -ACTION_WIDTH);
        } else if (translateX.value < 0) {
          // Allow swiping back to close
          translateX.value = Math.min(e.translationX + translateX.value, 0);
        }
      }
    })
    .onEnd(() => {
      // Don't process if dragging
      if (isActive || isDragging.value) {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        return;
      }

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
    .activeOffsetX([-44, 44]) // Apple guideline: 44pt minimum for gesture recognition
    .failOffsetY([-20, 20]) // Fail on significant vertical movement (prevents interference with scroll/drag)
    .minPointers(1)
    .maxPointers(1);

  // Compose gestures with proper priority following Apple guidelines:
  // 1. Taps pass through immediately (handled by TouchableOpacity in children - not blocked)
  // 2. Long press (drag) activates after 400ms
  // 3. Pan (swipe) only activates on clear horizontal swipes (44pt+), fails quickly on vertical
  // Using Simultaneous allows both to coexist, but pan checks isActive/isDragging to avoid conflicts
  const composedGesture = longPressGesture
    ? Gesture.Simultaneous(
        longPressGesture,
        panGesture
      )
    : panGesture;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animate action buttons opacity based on swipe position
  // Hide buttons when dragging to avoid visual conflicts
  const actionButtonsStyle = useAnimatedStyle(() => {
    if (isDragging.value || isActive) {
      return { opacity: 0 };
    }
    
    // Calculate opacity based on swipe distance
    // Fully visible when swiped at least 44pt (Apple minimum), fade in smoothly
    const swipeDistance = Math.abs(translateX.value);
    const opacity = Math.min(swipeDistance / 44, 1);
    return {
      opacity: translateX.value < 0 ? opacity : 0,
    };
  });

  const handleEdit = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    onEdit();
  };

  const handleDelete = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    onDelete();
  };

  return (
    <View style={[styles.swipeableContainer, containerStyle]}>
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

      {/* Card Content (on top) */}
      <Animated.View style={[cardStyle, styles.cardWrapper, isActive && styles.activeCard]}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.gestureArea}>
            {children}
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
  activeCard: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  gestureArea: {
    width: '100%',
  },
});

