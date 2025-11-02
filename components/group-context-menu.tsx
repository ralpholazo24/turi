import { StyleSheet, Modal, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';

interface GroupContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GroupContextMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
}: GroupContextMenuProps) {
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

  if (!visible) return null;

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
        <View style={styles.container}>
          <View
            style={[
              styles.menu,
              { backgroundColor, borderColor: borderColor + '30' },
            ]}
            onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: borderColor + '30' }]}
              onPress={handleEdit}
              activeOpacity={0.7}>
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                  <EditIcon size={18} color="#3B82F6" />
                </View>
                <ThemedText style={styles.menuItemText}>Edit Group</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
              activeOpacity={0.7}>
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIcon, { backgroundColor: '#EF4444' + '20' }]}>
                  <DeleteIcon size={18} color="#EF4444" />
                </View>
                <ThemedText style={[styles.menuItemText, styles.deleteText]}>
                  Delete Group
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menu: {
    minWidth: 200,
    borderRadius: BORDER_RADIUS.large,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  deleteText: {
    color: '#EF4444',
  },
});

