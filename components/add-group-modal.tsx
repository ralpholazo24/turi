import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import {
    DEFAULT_GROUP_COLOR,
    DEFAULT_GROUP_ICON,
    GROUP_COLOR_PRESETS,
    GROUP_ICON_OPTIONS,
    type GroupColorPreset,
    type GroupIconName,
} from '@/constants/groups';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddGroupModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddGroupModal({ visible, onClose }: AddGroupModalProps) {
  const { createGroup } = useAppStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<GroupIconName>(DEFAULT_GROUP_ICON);
  const [selectedColor, setSelectedColor] = useState<GroupColorPreset>(DEFAULT_GROUP_COLOR);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const CheckIcon = APP_ICONS.check;

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    await createGroup(
      name.trim(),
      selectedIcon,
      selectedColor.start,
      selectedColor.end
    );

    // Reset form
    setName('');
    setSelectedIcon(DEFAULT_GROUP_ICON);
    setSelectedColor(DEFAULT_GROUP_COLOR);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon(DEFAULT_GROUP_ICON);
    setSelectedColor(DEFAULT_GROUP_COLOR);
    onClose();
  };

  const IconComponent = (
    // eslint-disable-next-line import/namespace
    LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.backdrop} />
        <SafeAreaView style={[styles.modalContent, { backgroundColor }]} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              New Crew
            </ThemedText>
            <TouchableOpacity onPress={handleSave} disabled={!name.trim()}>
              <ThemedText
                style={[
                  styles.saveButton,
                  !name.trim() && styles.saveButtonDisabled,
                ]}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Crew Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder="e.g., Family Chores"
                placeholderTextColor={textColor + '80'}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Icon</ThemedText>
              <View style={styles.iconGrid}>
                {GROUP_ICON_OPTIONS.map((icon) => {
                  // eslint-disable-next-line import/namespace
                  const Icon = LucideIcons[icon.component as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                  const isSelected = selectedIcon === icon.component;
                  return (
                    <TouchableOpacity
                      key={icon.name}
                      style={[
                        styles.iconButton,
                        isSelected && styles.iconButtonSelected,
                        { borderColor },
                      ]}
                      onPress={() => setSelectedIcon(icon.component as GroupIconName)}>
                      {Icon && (
                        <Icon
                          size={24}
                          color={isSelected ? '#0a7ea4' : textColor}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Color Theme</ThemedText>
              <View style={styles.colorGrid}>
                {GROUP_COLOR_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.colorOption}
                    onPress={() => setSelectedColor(preset)}>
                    <View
                      style={[
                        styles.colorPreview,
                        selectedColor.start === preset.start &&
                          selectedColor.end === preset.end &&
                          styles.colorPreviewSelected,
                      ]}>
                      <LinearGradient
                        colors={[preset.start, preset.end]}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.colorGradient}>
                        {selectedColor.start === preset.start &&
                          selectedColor.end === preset.end && (
                            <CheckIcon size={20} color="#FFFFFF" />
                          )}
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Preview</ThemedText>
              <View style={styles.previewCard}>
                <LinearGradient
                  colors={[selectedColor.start, selectedColor.end]}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.previewGradient}>
                  <View style={styles.previewContent}>
                    <View style={styles.previewIconContainer}>
                      <View style={styles.previewIconBackground}>
                        {IconComponent && (
                          <IconComponent size={28} color="#FFFFFF" />
                        )}
                      </View>
                    </View>
                    <Text style={styles.previewName}>{name || 'Crew Name'}</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  saveButtonDisabled: {
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconButtonSelected: {
    borderWidth: 3,
    borderColor: '#0a7ea4',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 60,
    height: 60,
  },
  colorPreview: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorPreviewSelected: {
    borderColor: '#0a7ea4',
  },
  colorGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginTop: 8,
  },
  previewGradient: {
    padding: 20,
    minHeight: 100,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIconContainer: {
    marginRight: 12,
  },
  previewIconBackground: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
