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
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
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
  const { t } = useTranslation();
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
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const CloseIcon = APP_ICONS.close;
  const EditIcon = APP_ICONS.pen;
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
              <CloseIcon size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.headerTitle} i18nKey="group.newGroup" />
            <TouchableOpacity
              style={[
                styles.headerSaveButton,
                !name.trim() && styles.headerSaveButtonDisabled,
                { backgroundColor: buttonBackgroundColor },
              ]}
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.8}>
              <CheckIcon size={20} color={buttonTextColor} />
            </TouchableOpacity>
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
                <ThemedText style={styles.label} i18nKey="group.groupName" />
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t('taskModal.groupNamePlaceholder')}
                placeholderTextColor={textColor + '80'}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label} i18nKey="group.pickIcon" />
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
              <ThemedText style={styles.label} i18nKey="group.colorTheme" />
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
    flex: 1,
    textAlign: 'center',
  },
  headerSaveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSaveButtonDisabled: {
    opacity: 0.4,
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
});
