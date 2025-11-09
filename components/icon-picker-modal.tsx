import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as LucideIcons from 'lucide-react-native';
import { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type IconOption = {
  readonly name: string;
  readonly component: string;
};

interface IconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  icons: IconOption[];
  selectedIcon: string;
  title: string;
}

export function IconPickerModal({
  visible,
  onClose,
  onSelect,
  icons,
  selectedIcon,
  title,
}: IconPickerModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const { width: screenWidth } = useWindowDimensions();

  const CloseIcon = APP_ICONS.close;

  // Calculate responsive icon size and grid layout
  const gridConfig = useMemo(() => {
    const horizontalPadding = 32; // 16px padding on each side
    const gap = 12; // Gap between icons
    const iconsPerRow = 5; // Target 5 icons per row
    const availableWidth = screenWidth - horizontalPadding;
    const totalGapWidth = gap * (iconsPerRow - 1);
    const iconSize = Math.floor((availableWidth - totalGapWidth) / iconsPerRow);
    
    // Clamp icon size between min and max for better UX
    const minSize = 56;
    const maxSize = 80;
    const clampedSize = Math.max(minSize, Math.min(maxSize, iconSize));
    
    // Recalculate to ensure proper distribution
    const actualTotalWidth = (clampedSize * iconsPerRow) + totalGapWidth;
    const remainingSpace = availableWidth - actualTotalWidth;
    const extraPadding = Math.max(0, Math.floor(remainingSpace / 2));
    
    return {
      iconSize: clampedSize,
      gap,
      iconsPerRow,
      extraPadding,
    };
  }, [screenWidth]);

  const handleSelect = (iconComponent: string) => {
    onSelect(iconComponent);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={[styles.modalContent, { backgroundColor }]} edges={['bottom']}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <CloseIcon size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              {title}
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          {/* Icon Grid */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View 
              style={[
                styles.iconGrid, 
                { 
                  gap: gridConfig.gap,
                  paddingHorizontal: 16 + gridConfig.extraPadding,
                  paddingTop: 16,
                }
              ]}>
              {icons.map((icon) => {
                // eslint-disable-next-line import/namespace
                const IconComponent = LucideIcons[icon.component as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                const isSelected = selectedIcon === icon.component;
                
                return (
                  <TouchableOpacity
                    key={icon.component}
                    style={[
                      styles.iconButton,
                      isSelected && styles.iconButtonSelected,
                      {
                        borderColor,
                        width: gridConfig.iconSize,
                        height: gridConfig.iconSize,
                      },
                    ]}
                    onPress={() => handleSelect(icon.component)}
                    activeOpacity={0.7}>
                    {IconComponent && (
                      <IconComponent
                        size={24}
                        color={isSelected ? '#10B981' : textColor}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: BORDER_RADIUS.xlarge,
    borderTopRightRadius: BORDER_RADIUS.xlarge,
    marginTop: 'auto',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  iconButton: {
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconButtonSelected: {
    borderWidth: 3,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
});

