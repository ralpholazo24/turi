import { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Group } from '@/types';
import { useAppStore } from '@/store/use-app-store';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { MEMBER_ICON_OPTIONS, type MemberIconName } from '@/constants/icons-task-member';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
}

export function AddMemberModal({ visible, onClose, group }: AddMemberModalProps) {
  const { addMember } = useAppStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<MemberIconName>('User');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const CloseIcon = APP_ICONS.close;
  const EditIcon = APP_ICONS.edit;

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    await addMember(group.id, name.trim(), selectedIcon);

    // Reset form
    setName('');
    setSelectedIcon('User');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon('User');
    onClose();
  };

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
              Add New Member
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View style={styles.section}>
              <View style={styles.avatarPreviewContainer}>
                <TouchableOpacity
                  style={styles.avatarPreview}
                  onPress={() => {
                    // Could open icon picker here if needed
                  }}>
                  <View style={[styles.avatarCircle, { backgroundColor: '#E0F2F1' }]}>
                    {/* eslint-disable-next-line import/namespace */}
                    {(() => {
                      const IconComponent = LucideIcons[selectedIcon] as React.ComponentType<{ size?: number; color?: string }>;
                      return IconComponent ? <IconComponent size={56} color="#11181C" /> : null;
                    })()}
                  </View>
                  <View style={styles.editButton}>
                    <EditIcon size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <ThemedText style={styles.avatarHint}>Pick an icon avatar</ThemedText>
              </View>
            </View>

            {/* Icon Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Icon</ThemedText>
              <View style={styles.iconGrid}>
                {MEMBER_ICON_OPTIONS.map((iconOption) => {
                  // eslint-disable-next-line import/namespace
                  const IconComponent = LucideIcons[iconOption.component as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; color?: string }>;
                  const isSelected = selectedIcon === iconOption.component;
                  return (
                    <TouchableOpacity
                      key={iconOption.component}
                      style={[
                        styles.iconButton,
                        isSelected && styles.iconButtonSelected,
                        { borderColor },
                      ]}
                      onPress={() => setSelectedIcon(iconOption.component)}>
                      {IconComponent && (
                        <IconComponent size={24} color={isSelected ? '#10B981' : textColor} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder="Enter name..."
                placeholderTextColor={textColor + '80'}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
          </ScrollView>

          {/* Add Member Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.addButton,
                !name.trim() && styles.addButtonDisabled,
                { backgroundColor: '#10B981' },
              ]}
              onPress={handleSave}
              disabled={!name.trim()}>
              <Text style={styles.addButtonText}>Add Member</Text>
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
  avatarPreviewContainer: {
    alignItems: 'center',
  },
  avatarPreview: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.circular.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    fontSize: 14,
    opacity: 0.6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

