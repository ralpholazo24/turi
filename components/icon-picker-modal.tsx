import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as LucideIcons from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

  const CloseIcon = APP_ICONS.close;
  const CheckIcon = APP_ICONS.check;

  // Calculate spacing for even grid layout
  const screenWidth = Dimensions.get('window').width;
  const padding = 20;
  const iconSize = 48;
  const iconsPerRow = 5;
  const availableWidth = screenWidth - (padding * 2);
  const totalIconsWidth = iconsPerRow * iconSize;
  const remainingSpace = availableWidth - totalIconsWidth;
  const iconSpacing = remainingSpace / (iconsPerRow + 1);

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
        <View style={styles.backdrop} />
        <SafeAreaView style={[styles.modalContent, { backgroundColor }]} edges={['bottom']}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
            <TouchableOpacity onPress={onClose}>
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
            <View style={[styles.iconGrid, { paddingLeft: iconSpacing }]}>
              {icons.map((icon, index) => {
                // eslint-disable-next-line import/namespace
                const IconComponent = LucideIcons[icon.component as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                const isSelected = selectedIcon === icon.component;
                const isFirstInRow = index % iconsPerRow === 0;
                
                return (
                  <TouchableOpacity
                    key={icon.component}
                    style={[
                      styles.iconButton,
                      isSelected && styles.iconButtonSelected,
                      {
                        borderColor,
                        marginLeft: isFirstInRow ? 0 : iconSpacing,
                        marginTop: index >= iconsPerRow ? iconSpacing : 0,
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
    padding: 20,
    paddingBottom: 40,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  iconButtonSelected: {
    borderWidth: 3,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
});

