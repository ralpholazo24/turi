import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete: () => void;
  hideEditButton?: boolean;
  hideDeleteButton?: boolean; // Add this line
  drag?: () => void;
  isActive?: boolean;
  containerStyle?: object;
  isOpen?: boolean;
  onSwipeStart?: () => void;
  onSwipeClose?: () => void;
}

const EDIT_BUTTON_WIDTH = 80; // Width for edit button only
const DELETE_BUTTON_WIDTH = 80; // Width for delete button
const ACTION_WIDTH = EDIT_BUTTON_WIDTH + DELETE_BUTTON_WIDTH; // Total width for both buttons

export function SwipeableCard({
  children,
  onEdit,
  onDelete,
  hideEditButton = false,
  hideDeleteButton = false, // Add this line
  drag,
  isActive,
  containerStyle,
  isOpen: controlledIsOpen,
  onSwipeStart,
  onSwipeClose,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const showDeleteButton = useSharedValue(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const EditIcon = APP_ICONS.edit;
  const DeleteIcon = APP_ICONS.delete;

  // Calculate action width based on swipe state
  // First swipe: show only edit button (if not hidden)
  // Second swipe: show both buttons
  // Use animated style for dynamic width
  const actionButtonsWidthStyle = useAnimatedStyle(() => {
    // If both buttons are hidden, no swipe width
    if (hideEditButton && hideDeleteButton) {
      return { width: 0 };
    }
    
    let width = EDIT_BUTTON_WIDTH;
    if (hideEditButton) {
      // Only delete button visible
      width = hideDeleteButton ? 0 : DELETE_BUTTON_WIDTH;
    } else if (hideDeleteButton) {
      // Only edit button visible
      width = EDIT_BUTTON_WIDTH;
    } else if (showDeleteButton.value) {
      // Both buttons visible
      width = ACTION_WIDTH;
    }
    return { width };
  });

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

  // Close card when controlled isOpen becomes false
  useEffect(() => {
    if (controlledIsOpen !== undefined && !controlledIsOpen) {
      // Close the card with animation
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      setInternalIsOpen(false);
      showDeleteButton.value = false;
    }
  }, [controlledIsOpen]);

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
      // Notify parent that swiping started (to close other cards)
      if (onSwipeStart && translateX.value === 0) {
        runOnJS(onSwipeStart)();
      }
    })
    .onUpdate((e) => {
      // Don't process swipe if dragging is active
      if (isActive || isDragging.value) {
        return;
      }

      // Don't allow swiping if both buttons are hidden
      if (hideEditButton && hideDeleteButton) {
        return;
      }

      // Only allow swiping left (negative values) and require clear horizontal intent
      const horizontalMovement = Math.abs(e.translationX);
      const verticalMovement = Math.abs(e.translationY);
      
      // Early fail: if vertical movement is clearly dominant, don't process
      if (verticalMovement > horizontalMovement * 1.2 && horizontalMovement < 20) {
        return;
      }
      
      if (horizontalMovement > verticalMovement * 1.5) {
        if (e.translationX < 0) {
          // Show delete button when swiped past edit button (only if delete button is not hidden)
          if (!hideEditButton && !hideDeleteButton && !showDeleteButton.value && Math.abs(e.translationX) > EDIT_BUTTON_WIDTH * 0.8) {
            showDeleteButton.value = true;
          }
          
          // Calculate max swipe distance based on current state
          let maxWidth = 0;
          if (hideEditButton && !hideDeleteButton) {
            maxWidth = DELETE_BUTTON_WIDTH;
          } else if (!hideEditButton && hideDeleteButton) {
            maxWidth = EDIT_BUTTON_WIDTH;
          } else if (!hideEditButton && !hideDeleteButton) {
            maxWidth = showDeleteButton.value ? ACTION_WIDTH : EDIT_BUTTON_WIDTH;
          }
          translateX.value = Math.max(e.translationX, -maxWidth);
        } else if (translateX.value < 0) {
          // Allow swiping back to close
          translateX.value = Math.min(e.translationX + translateX.value, 0);
          // Reset delete button visibility when swiping back
          if (showDeleteButton.value && translateX.value > -EDIT_BUTTON_WIDTH * 0.5) {
            showDeleteButton.value = false;
          }
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
        showDeleteButton.value = false;
        return;
      }

      // Don't allow swipe if both buttons are hidden
      if (hideEditButton && hideDeleteButton) {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        return;
      }

      // Calculate current action width
      let currentActionWidth = 0;
      if (hideEditButton && !hideDeleteButton) {
        currentActionWidth = DELETE_BUTTON_WIDTH;
      } else if (!hideEditButton && hideDeleteButton) {
        currentActionWidth = EDIT_BUTTON_WIDTH;
      } else if (!hideEditButton && !hideDeleteButton) {
        currentActionWidth = showDeleteButton.value ? ACTION_WIDTH : EDIT_BUTTON_WIDTH;
      }
      
      const threshold = currentActionWidth / 2;

      // If swiped more than half the current action width, open
      if (translateX.value < -threshold) {
        translateX.value = withSpring(-currentActionWidth, {
          damping: 20,
          stiffness: 300,
        });
        if (controlledIsOpen === undefined) {
          runOnJS(setInternalIsOpen)(true);
        }
      } else {
        // Otherwise, close
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        showDeleteButton.value = false;
        if (controlledIsOpen === undefined) {
          runOnJS(setInternalIsOpen)(false);
        } else if (onSwipeClose) {
          // Notify parent that card was closed
          runOnJS(onSwipeClose)();
        }
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
    transform: [
      { translateX: translateX.value },
      { scale: isActive ? 0.95 : 1 },
    ],
    opacity: isActive ? 0.8 : 1,
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
    showDeleteButton.value = false;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    } else if (onSwipeClose) {
      onSwipeClose();
    }
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    showDeleteButton.value = false;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    } else if (onSwipeClose) {
      onSwipeClose();
    }
    onDelete();
  };

  // Animate delete button visibility based on swipe position
  const deleteButtonStyle = useAnimatedStyle(() => {
    if (isDragging.value || isActive) {
      return { opacity: 0 };
    }
    
    // Hide delete button if hideDeleteButton is true
    if (hideDeleteButton) {
      return { opacity: 0 };
    }
    
    // Show delete button immediately if edit button is hidden, otherwise show after swiping past edit button
    const opacity = hideEditButton || showDeleteButton.value ? 1 : 0;
    return {
      opacity: translateX.value < 0 ? opacity : 0,
    };
  });

  return (
    <View style={[styles.swipeableContainer, containerStyle]}>
      {/* Action Buttons (behind the card) */}
      <Animated.View style={[styles.actionButtonsContainer, actionButtonsWidthStyle, actionButtonsStyle]}>
        {!hideEditButton && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
            activeOpacity={0.8}>
            <EditIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {!hideDeleteButton && ( // Wrap delete button with this condition
          <Animated.View style={deleteButtonStyle}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.8}>
              <DeleteIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {/* Card Content (on top) */}
      <Animated.View style={[cardStyle, styles.cardWrapper]}>
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
    paddingHorizontal: 4, // Add padding for button spacing
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 56, // Fixed circular size
    height: 56, // Fixed circular size
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28, // Half of width/height to make perfect circle
    marginHorizontal: 4, // Add spacing between buttons
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cardWrapper: {
    backgroundColor: 'transparent',
    zIndex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gestureArea: {
    width: '100%',
  },
});

