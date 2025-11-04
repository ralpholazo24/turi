import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/store/use-user-store';
import { useAppStore } from '@/store/use-app-store';
import { MemberAvatar } from '@/components/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
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

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, updateUser } = useUserStore();
  const { groups, updateMember } = useAppStore();
  const [name, setName] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!name.trim() || !user) {
      return;
    }

    try {
      // Update user profile (only name, avatar color stays the same)
      await updateUser({
        name: name.trim(),
      });

      // Sync name changes to all groups where user is a member
      for (const group of groups) {
        const userMember = group.members.find(m => m.id === user.id);
        if (userMember) {
          await updateMember(group.id, user.id, {
            name: name.trim(),
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleClose = () => {
    if (user) {
      setName(user.name);
    }
    onClose();
  };

  if (!user) {
    return null;
  }

  // Create a temporary member object for avatar preview
  const previewMember = {
    id: user.id,
    name: name.trim() || t('onboarding.yourName'),
    avatarColor: user.avatarColor,
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
              <APP_ICONS.close size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.headerTitle} i18nKey="profile.title" />
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
            {/* Avatar Preview */}
            <View style={styles.avatarSection}>
              <MemberAvatar member={previewMember} size={120} />
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <ThemedText style={styles.label} i18nKey="profile.nameLabel" />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={textColor + '80'}
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
              />
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
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  inputSection: {
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
    fontSize: 18,
    minHeight: 56,
  },
});

