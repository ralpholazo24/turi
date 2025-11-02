import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import {
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
import { useState, useEffect } from 'react';
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
import { Group } from '@/types';

interface EditGroupModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
}

export function EditGroupModal({ visible, onClose, group }: EditGroupModalProps) {
  const { updateGroup } = useAppStore();
  const [name, setName] = useState(group.name);
  const [selectedIcon, setSelectedIcon] = useState<GroupIconName>(group.icon as GroupIconName);
  const [selectedColor, setSelectedColor] = useState<GroupColorPreset>(
    GROUP_COLOR_PRESETS.find(
      (preset) => preset.start === group.colorStart && preset.end === group.colorEnd
    ) || GROUP_COLOR_PRESETS[0]
  );

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const CloseIcon = APP_ICONS.close;
  const EditIcon = APP_ICONS.pen;
  const CheckIcon = APP_ICONS.check;

  // Update form when group changes
  useEffect(() => {
    if (visible && group) {
      setName(group.name);
      setSelectedIcon(group.icon as GroupIconName);
      const matchingColor = GROUP_COLOR_PRESETS.find(
        (preset) => preset.start === group.colorStart && preset.end === group.colorEnd
      );
      if (matchingColor) {
        setSelectedColor(matchingColor);
      }
    }
  }, [visible, group]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    await updateGroup(group.id, {
      name: name.trim(),
      icon: selectedIcon,
      colorStart: selectedColor.start,
      colorEnd: selectedColor.end,
    });

    onClose();
  };

  const handleClose = () => {
    setName(group.name);
    setSelectedIcon(group.icon as GroupIconName);
    const matchingColor = GROUP_COLOR_PRESETS.find(
      (preset) => preset.start === group.colorStart && preset.end === group.colorEnd
    );
    if (matchingColor) {
      setSelectedColor(matchingColor);
    }
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
              <CloseIcon size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Edit Crew
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Icon Preview */}
            <View style={styles.section}>
              <View style={styles.iconPreviewContainer}>
                <View style={styles.iconPreview}>
                  <LinearGradient
                    colors={[selectedColor.start, selectedColor.end]}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.previewGradient}>
                    {IconComponent && (
                      <IconComponent size={48} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <EditIcon size={20} color={textColor} style={styles.labelIcon} />
                <ThemedText style={styles.label}>Crew Name</ThemedText>
              </View>
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
              <ThemedText style={styles.label}>Pick an icon</ThemedText>
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
                          color={isSelected ? '#10B981' : textColor}
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
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !name.trim() && styles.saveButtonDisabled,
                { backgroundColor: '#10B981' },
              ]}
              onPress={handleSave}
              disabled={!name.trim()}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  iconPreviewContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconPreview: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.xlarge,
    overflow: 'hidden',
  },
  previewGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelIcon: {
    marginRight: 8,
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
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
    borderColor: '#10B981',
  },
  colorGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

