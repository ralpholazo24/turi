import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { Group, Member } from '@/types';
import { useEffect, useState } from 'react';
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

interface MemberModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  member?: Member; // Optional - if provided, it's edit mode; if not, it's add mode
}

export function MemberModal({ visible, onClose, group, member }: MemberModalProps) {
  const { t } = useTranslation();
  const { addMember, updateMember } = useAppStore();
  const isEditMode = !!member;

  // Initialize state based on mode
  const [name, setName] = useState(
    isEditMode ? member!.name : ''
  );

  // Update form when member changes (edit mode) or reset to defaults (add mode)
  useEffect(() => {
    if (visible && isEditMode && member) {
      setName(member.name);
    } else if (visible && !isEditMode) {
      // Add mode: reset to defaults
      setName('');
    }
  }, [visible, member, isEditMode]);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const CloseIcon = APP_ICONS.close;

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    if (isEditMode && member) {
      // Edit mode: update existing member
      await updateMember(group.id, member.id, { name: name.trim() });
    } else {
      // Add mode: create new member
      await addMember(group.id, name.trim());
    }

    onClose();
  };

  const handleClose = () => {
    if (isEditMode && member) {
      // Edit mode: reset to member values
      setName(member.name);
    } else {
      // Add mode: reset to defaults
      setName('');
    }
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
            <ThemedText
              type="subtitle"
              style={styles.headerTitle}
              i18nKey={isEditMode ? 'member.editMember' : 'member.addNewMember'}
            />
            <TouchableOpacity
              style={[
                styles.headerSaveButton,
                !name.trim() && styles.headerSaveButtonDisabled,
                { backgroundColor: buttonBackgroundColor },
              ]}
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.8}>
              <APP_ICONS.check size={20} color={buttonTextColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
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
              autoFocus={isEditMode}
            />
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
});
