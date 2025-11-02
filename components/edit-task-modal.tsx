import { useState, useEffect } from 'react';
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
import { Group, Task } from '@/types';
import { useAppStore } from '@/store/use-app-store';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { TASK_ICON_OPTIONS, type TaskIconName } from '@/constants/icons-task-member';
import { MemberAvatar } from '@/components/member-avatar';
import { TimePicker } from '@/components/time-picker';

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  task: Task;
}

export function EditTaskModal({ visible, onClose, group, task }: EditTaskModalProps) {
  const { updateTask } = useAppStore();
  const [taskName, setTaskName] = useState(task.name);
  const [selectedIcon, setSelectedIcon] = useState<TaskIconName>(task.icon as TaskIconName);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(task.frequency);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(task.memberIds));
  
  // Scheduling options
  const [scheduleWeek, setScheduleWeek] = useState<number | undefined>(task.scheduleWeek);
  const [scheduleDay, setScheduleDay] = useState<number | undefined>(task.scheduleDay);
  const [scheduleTime, setScheduleTime] = useState<string>(task.scheduleTime || '');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const CloseIcon = APP_ICONS.close;
  const EditIcon = APP_ICONS.pen;
  const CalendarIcon = APP_ICONS.calendar;
  const CheckIcon = APP_ICONS.check;
  
  // Days of the week
  const DAYS = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];
  
  // Weeks of the month
  const WEEKS = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
  ];
  
  // Validate time format (HH:MM)
  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time) || time === '';
  };
  
  const handleTimeChange = (time: string) => {
    setScheduleTime(time);
  };
  
  const handleClearTime = () => {
    setScheduleTime('');
  };

  // Initialize with task data
  useEffect(() => {
    if (visible) {
      setTaskName(task.name);
      setSelectedIcon(task.icon as TaskIconName);
      setFrequency(task.frequency);
      setSelectedMembers(new Set(task.memberIds));
      setScheduleWeek(task.scheduleWeek);
      setScheduleDay(task.scheduleDay);
      setScheduleTime(task.scheduleTime || '');
    }
  }, [visible, task]);

  const handleSelectAll = () => {
    if (selectedMembers.size === group.members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(group.members.map((m) => m.id)));
    }
  };

  const handleToggleMember = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const handleSave = async () => {
    if (!taskName.trim() || selectedMembers.size === 0) {
      return;
    }

    // Validate time if provided
    if (scheduleTime && !validateTime(scheduleTime)) {
      return;
    }

    // Adjust assignedIndex if current assignee is removed
    const newMemberIds = Array.from(selectedMembers);
    const currentMemberId = task.memberIds[task.assignedIndex];
    let newAssignedIndex = task.assignedIndex;

    if (!newMemberIds.includes(currentMemberId)) {
      // Current assignee was removed, set to first member
      newAssignedIndex = 0;
    } else {
      // Find new index for current member in new list
      newAssignedIndex = newMemberIds.indexOf(currentMemberId);
    }

    await updateTask(group.id, task.id, {
      name: taskName.trim(),
      icon: selectedIcon,
      frequency,
      memberIds: newMemberIds,
      assignedIndex: newAssignedIndex,
      scheduleWeek: frequency === 'monthly' ? scheduleWeek : undefined,
      scheduleDay: (frequency === 'weekly' || frequency === 'monthly') ? scheduleDay : undefined,
      scheduleTime: scheduleTime || undefined,
    });

    onClose();
  };

  const handleClose = () => {
    setTaskName(task.name);
    setSelectedIcon(task.icon as TaskIconName);
    setFrequency(task.frequency);
    setSelectedMembers(new Set(task.memberIds));
    onClose();
  };

  const allSelected = selectedMembers.size === group.members.length && group.members.length > 0;

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
              Edit Task
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Task Icon Preview */}
            <View style={styles.section}>
              <View style={styles.iconPreviewContainer}>
                <View style={styles.iconPreview}>
                  {/* eslint-disable-next-line import/namespace */}
                  {(() => {
                    const IconComponent = LucideIcons[selectedIcon] as React.ComponentType<{ size?: number; color?: string }>;
                    return IconComponent ? <IconComponent size={48} color="#11181C" /> : null;
                  })()}
                </View>
              </View>
            </View>

            {/* Task Name Input */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <EditIcon size={20} color={textColor} style={styles.labelIcon} />
                <ThemedText style={styles.label}>Task name</ThemedText>
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder="e.g., Water the plants"
                placeholderTextColor={textColor + '80'}
                value={taskName}
                onChangeText={setTaskName}
                autoFocus
              />
            </View>

            {/* Frequency Selector */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>How often?</ThemedText>
              <View style={styles.frequencyContainer}>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'daily' && styles.frequencyButtonActive,
                    { backgroundColor: frequency === 'daily' ? '#10B981' : borderColor + '30' },
                  ]}
                  onPress={() => setFrequency('daily')}>
                  <CalendarIcon size={20} color={frequency === 'daily' ? '#FFFFFF' : '#687076'} />
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === 'daily' && styles.frequencyTextActive,
                    ]}>
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'weekly' && styles.frequencyButtonActive,
                    { backgroundColor: frequency === 'weekly' ? '#10B981' : borderColor + '30' },
                  ]}
                  onPress={() => setFrequency('weekly')}>
                  <CalendarIcon size={20} color={frequency === 'weekly' ? '#FFFFFF' : '#687076'} />
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === 'weekly' && styles.frequencyTextActive,
                    ]}>
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'monthly' && styles.frequencyButtonActive,
                    { backgroundColor: frequency === 'monthly' ? '#10B981' : borderColor + '30' },
                  ]}
                  onPress={() => setFrequency('monthly')}>
                  <CalendarIcon size={20} color={frequency === 'monthly' ? '#FFFFFF' : '#687076'} />
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === 'monthly' && styles.frequencyTextActive,
                    ]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scheduling Options */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Schedule</ThemedText>
              
              {/* Week selector for monthly */}
              {frequency === 'monthly' && (
                <View style={styles.scheduleRow}>
                  <ThemedText style={styles.scheduleLabel}>Week:</ThemedText>
                  <View style={styles.scheduleButtonGroup}>
                    {WEEKS.map((week) => (
                      <TouchableOpacity
                        key={week.value}
                        style={[
                          styles.scheduleButton,
                          scheduleWeek === week.value && styles.scheduleButtonActive,
                          { backgroundColor: scheduleWeek === week.value ? '#10B981' : borderColor + '30' },
                        ]}
                        onPress={() => setScheduleWeek(week.value)}>
                        <Text
                          style={[
                            styles.scheduleButtonText,
                            scheduleWeek === week.value && styles.scheduleButtonTextActive,
                          ]}>
                          {week.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Day selector for weekly and monthly */}
              {(frequency === 'weekly' || frequency === 'monthly') && (
                <View style={styles.scheduleRow}>
                  <ThemedText style={styles.scheduleLabel}>Day:</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dayScroll}>
                    {DAYS.map((day) => (
                      <TouchableOpacity
                        key={day.value}
                        style={[
                          styles.scheduleButton,
                          scheduleDay === day.value && styles.scheduleButtonActive,
                          { backgroundColor: scheduleDay === day.value ? '#10B981' : borderColor + '30' },
                        ]}
                        onPress={() => setScheduleDay(day.value)}>
                        <Text
                          style={[
                            styles.scheduleButtonText,
                            scheduleDay === day.value && styles.scheduleButtonTextActive,
                          ]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Time selector - Optional for all frequencies */}
              <View style={styles.scheduleRow}>
                <ThemedText style={styles.scheduleLabel}>Time (optional):</ThemedText>
                <TimePicker
                  value={scheduleTime}
                  onChange={handleTimeChange}
                  onClear={handleClearTime}
                />
              </View>
            </View>

            {/* Icon Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Pick an icon</ThemedText>
              <View style={styles.iconGrid}>
                {TASK_ICON_OPTIONS.map((iconOption) => {
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

            {/* Member Selector */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>Who&apos;s in?</ThemedText>
                <TouchableOpacity onPress={handleSelectAll}>
                  <ThemedText style={styles.selectAllText}>
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {group.members.length === 0 ? (
                <ThemedText style={styles.noMembersText}>
                  Add members first to assign tasks
                </ThemedText>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.memberScroll}>
                  {group.members.map((member) => {
                    const isSelected = selectedMembers.has(member.id);
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={styles.memberOption}
                        onPress={() => handleToggleMember(member.id)}>
                        <View style={styles.memberAvatarContainer}>
                          <View
                            style={[
                              styles.memberAvatar,
                              isSelected && styles.memberAvatarSelected,
                            ]}>
                            <MemberAvatar member={member} size={40} />
                          </View>
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <CheckIcon size={12} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                        <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!taskName.trim() || selectedMembers.size === 0) && styles.saveButtonDisabled,
                { backgroundColor: '#10B981' },
              ]}
              onPress={handleSave}
              disabled={!taskName.trim() || selectedMembers.size === 0}>
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
  closeButton: {
    fontSize: 24,
    color: '#11181C',
    fontWeight: '300',
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.medium,
    gap: 8,
  },
  frequencyButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#687076',
  },
  frequencyTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scheduleRow: {
    marginBottom: 16,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scheduleButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayScroll: {
    marginTop: 8,
  },
  scheduleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.medium,
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  scheduleButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#687076',
  },
  scheduleButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  selectAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  noMembersText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  memberScroll: {
    marginTop: 8,
  },
  memberOption: {
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.circular.xlarge,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  memberAvatarSelected: {
    borderColor: '#10B981',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circular.medium,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 12,
    textAlign: 'center',
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

