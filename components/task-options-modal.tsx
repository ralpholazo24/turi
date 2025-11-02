import { StyleSheet, Modal, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

interface TaskOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskOptionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
}: TaskOptionsModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const EditIcon = APP_ICONS.edit;
  const DeleteIcon = APP_ICONS.delete;

  const handleEdit = () => {
    onClose();
    onEdit();
  };

  const handleDelete = () => {
    onClose();
    onDelete();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}>
        <SafeAreaView style={styles.modalContainer} edges={[]}>
          <View
            style={[styles.modalContent, { backgroundColor, borderColor: borderColor + '30' }]}
            onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="subtitle" style={styles.headerTitle}>
                Task Options
              </ThemedText>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.option, { borderBottomColor: borderColor + '30' }]}
                onPress={handleEdit}
                activeOpacity={0.7}>
                <View style={styles.optionContent}>
                  <View style={[styles.optionIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                    <EditIcon size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <ThemedText style={styles.optionTitle}>Edit Task</ThemedText>
                    <ThemedText style={styles.optionSubtitle}>Modify task details</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={handleDelete}
                activeOpacity={0.7}>
                <View style={styles.optionContent}>
                  <View style={[styles.optionIcon, { backgroundColor: '#EF4444' + '20' }]}>
                    <DeleteIcon size={20} color="#EF4444" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <ThemedText style={[styles.optionTitle, styles.deleteOptionTitle]}>
                      Delete Task
                    </ThemedText>
                    <ThemedText style={styles.optionSubtitle}>
                      This action cannot be undone
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: borderColor + '30' }]}
                onPress={onClose}
                activeOpacity={0.7}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xlarge,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  option: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  deleteOptionTitle: {
    color: '#EF4444',
  },
  footer: {
    padding: 20,
    paddingTop: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

