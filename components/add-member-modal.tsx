import { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Group } from '@/types';
import { useAppStore } from '@/store/use-app-store';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
}

export function AddMemberModal({ visible, onClose, group }: AddMemberModalProps) {
  const { t } = useTranslation();
  const { addMember } = useAppStore();
  const [name, setName] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const CloseIcon = APP_ICONS.close;

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    // Use 'User' as default icon since we're showing initials instead
    await addMember(group.id, name.trim(), 'User');

    // Reset form
    setName('');
    onClose();
  };

  const handleClose = () => {
    setName('');
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
            <ThemedText type="subtitle" style={styles.headerTitle} i18nKey="member.addNewMember" />
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ThemedText style={styles.label} i18nKey="member.name" />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: backgroundColor, borderColor, color: textColor },
              ]}
              placeholder={t('member.namePlaceholder')}
              placeholderTextColor={textColor + '80'}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

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
              <Text style={styles.addButtonText}>{t('member.addMember')}</Text>
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
    borderTopLeftRadius: BORDER_RADIUS.xlarge,
    borderTopRightRadius: BORDER_RADIUS.xlarge,
    marginTop: 'auto',
    maxHeight: '50%',
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
  content: {
    padding: 20,
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

