import { IconPickerModal } from '@/components/icon-picker-modal';
import { MemberAvatar } from '@/components/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { TimePicker } from '@/components/time-picker';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { TASK_ICON_OPTIONS, type TaskIconName } from '@/constants/icons-task-member';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { Group, Task, TaskSchedule } from '@/types';
import { isSoloMode } from '@/utils/solo-mode';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as LucideIcons from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  task: Task;
}

export function EditTaskModal({ visible, onClose, group, task }: EditTaskModalProps) {
  const { t } = useTranslation();
  const { updateTask } = useAppStore();
  const [taskName, setTaskName] = useState(task.name);
  const [selectedIcon, setSelectedIcon] = useState<TaskIconName>(task.icon as TaskIconName);
  const [repeat, setRepeat] = useState<TaskSchedule['repeat']>(task.schedule.repeat);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(task.memberIds));
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Scheduling options - initialize from task.schedule
  const [startDate, setStartDate] = useState<Date>(new Date(task.schedule.startDate));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [scheduleDay, setScheduleDay] = useState<number | undefined>(task.schedule.dayOfWeek);
  const [scheduleTime, setScheduleTime] = useState<string>(task.schedule.time || '');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );
  const buttonBackgroundColor = useThemeColor({}, 'text');
  const buttonTextColor = useThemeColor({}, 'background');

  const CloseIcon = APP_ICONS.close;
  const EditIcon = APP_ICONS.pen;
  const CalendarIcon = APP_ICONS.calendar;
  const CheckIcon = APP_ICONS.check;
  
  // Days of the week
  const DAYS = [
    { value: 0, label: t('task.sunday') },
    { value: 1, label: t('task.monday') },
    { value: 2, label: t('task.tuesday') },
    { value: 3, label: t('task.wednesday') },
    { value: 4, label: t('task.thursday') },
    { value: 5, label: t('task.friday') },
    { value: 6, label: t('task.saturday') },
  ];

  // Repeat options
  const REPEAT_OPTIONS: { value: TaskSchedule['repeat']; label: string }[] = [
    { value: 'daily', label: t('schedule.repeat.daily') },
    { value: 'weekdays', label: t('schedule.repeat.weekdays') },
    { value: 'weekends', label: t('schedule.repeat.weekends') },
    { value: 'weekly', label: t('schedule.repeat.weekly') },
    { value: 'biweekly', label: t('schedule.repeat.biweekly') },
    { value: 'monthly', label: t('schedule.repeat.monthly') },
    { value: 'every3months', label: t('schedule.repeat.every3months') },
    { value: 'every6months', label: t('schedule.repeat.every6months') },
    { value: 'yearly', label: t('schedule.repeat.yearly') },
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
      setRepeat(task.schedule.repeat);
      setStartDate(new Date(task.schedule.startDate));
      // In solo mode, automatically select the solo member
      if (isSoloMode(group)) {
        setSelectedMembers(new Set([group.members[0].id]));
      } else {
        setSelectedMembers(new Set(task.memberIds));
      }
      setScheduleDay(task.schedule.dayOfWeek);
      setScheduleTime(task.schedule.time || '');
    }
  }, [visible, task, group]);

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
    if (!taskName.trim()) {
      return;
    }

    // In solo mode, automatically assign to the solo member
    const finalSelectedMembers = isSoloMode(group) 
      ? [group.members[0].id]
      : Array.from(selectedMembers);

    if (finalSelectedMembers.length === 0) {
      return;
    }

    // Validate time if provided
    if (scheduleTime && !validateTime(scheduleTime)) {
      return;
    }

    // Calculate new assigned index
    const newMemberIds = finalSelectedMembers;
    const currentMemberId = task.memberIds[task.assignedIndex];
    let newAssignedIndex = task.assignedIndex;

    if (!newMemberIds.includes(currentMemberId)) {
      // Current assignee was removed, set to first member
      newAssignedIndex = 0;
    } else {
      // Find new index for current member in new list
      newAssignedIndex = newMemberIds.indexOf(currentMemberId);
    }

    // Validate dayOfWeek for weekly/biweekly
    if ((repeat === 'weekly' || repeat === 'biweekly') && scheduleDay === undefined) {
      return; // Can't update weekly/biweekly task without day of week
    }

    // Build schedule object
    const schedule: TaskSchedule = {
      repeat,
      startDate: startDate.toISOString(),
      time: scheduleTime || undefined,
      dayOfWeek: (repeat === 'weekly' || repeat === 'biweekly') ? scheduleDay : undefined,
    };

    await updateTask(group.id, task.id, {
      name: taskName.trim(),
      icon: selectedIcon,
      memberIds: newMemberIds,
      assignedIndex: newAssignedIndex,
      schedule,
    });

    onClose();
  };

  const handleClose = () => {
    setTaskName(task.name);
    setSelectedIcon(task.icon as TaskIconName);
    setRepeat(task.schedule.repeat);
    setStartDate(new Date(task.schedule.startDate));
    setSelectedMembers(new Set(task.memberIds));
    setScheduleDay(task.schedule.dayOfWeek);
    setScheduleTime(task.schedule.time || '');
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
          <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
            <TouchableOpacity onPress={handleClose}>
              <CloseIcon size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.headerTitle} i18nKey="task.editTask" />
            <TouchableOpacity
              style={[
                styles.headerSaveButton,
                (!taskName.trim() || selectedMembers.size === 0) && styles.headerSaveButtonDisabled,
                { backgroundColor: buttonBackgroundColor },
              ]}
              onPress={handleSave}
              disabled={!taskName.trim() || selectedMembers.size === 0}
              activeOpacity={0.8}>
              <CheckIcon size={20} color={buttonTextColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Task Icon Preview - Clickable */}
            <View style={styles.section}>
              <View style={styles.iconPreviewContainer}>
                <TouchableOpacity
                  onPress={() => setShowIconPicker(true)}
                  activeOpacity={0.8}
                  style={styles.iconPreviewTouchable}>
                  <View style={[styles.iconPreview, styles.iconPreviewClickable, { backgroundColor: borderColor + '40', borderColor: '#10B981' }]}>
                    {(() => {
                      // eslint-disable-next-line import/namespace
                      const IconComponent = LucideIcons[selectedIcon] as React.ComponentType<{ size?: number; color?: string }>;
                      return IconComponent ? <IconComponent size={48} color={textColor} /> : null;
                    })()}
                  </View>
                </TouchableOpacity>
                <ThemedText style={styles.iconPreviewHint} i18nKey="taskModal.tapToChangeIcon" />
              </View>
            </View>

            {/* Member Selector - Hidden in solo mode */}
            {!isSoloMode(group) && (
              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <ThemedText style={styles.label} i18nKey="taskModal.whosIn" />
                  <TouchableOpacity onPress={handleSelectAll}>
                    <ThemedText style={styles.selectAllText}>
                      {allSelected ? t('taskModal.deselectAll') : t('taskModal.selectAll')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                {group.members.length === 0 ? (
                  <ThemedText style={styles.noMembersText} i18nKey="taskModal.addMembersFirst" />
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
            )}

            {/* Task Name Input */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label} i18nKey="taskModal.taskName" />
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t('taskModal.taskNamePlaceholder')}
                placeholderTextColor={textColor + '80'}
                value={taskName}
                onChangeText={setTaskName}
                autoFocus
              />
            </View>

            {/* Repeat Selector */}
            <View style={styles.section}>
              <ThemedText style={styles.label} i18nKey="taskModal.repeat" />
              <View style={styles.repeatContainer}>
                {REPEAT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.repeatButton,
                      repeat === option.value && styles.repeatButtonActive,
                      { 
                        backgroundColor: repeat === option.value ? '#10B981' : borderColor + '30',
                        borderColor: repeat === option.value ? '#10B981' : borderColor + '30',
                      },
                    ]}
                    onPress={() => {
                      setRepeat(option.value);
                      // Clear dayOfWeek if switching away from weekly/biweekly
                      if (option.value !== 'weekly' && option.value !== 'biweekly') {
                        setScheduleDay(undefined);
                      }
                    }}>
                    <Text
                      style={[
                        styles.repeatButtonText,
                        repeat === option.value && styles.repeatButtonTextActive,
                        { color: repeat === option.value ? '#FFFFFF' : textColor },
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Scheduling Options */}
            <View style={styles.section}>
              <ThemedText style={styles.label} i18nKey="taskModal.schedule" />
              
              {/* Start Date Picker */}
              <View style={styles.scheduleRow}>
                <ThemedText style={styles.scheduleLabel} i18nKey="taskModal.startDate" />
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor, borderColor }]}
                  onPress={() => setShowStartDatePicker(true)}>
                  <CalendarIcon size={20} color={textColor} style={styles.icon} />
                  <ThemedText style={[styles.dateText, { color: textColor }]}>
                    {startDate.toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Day selector for weekly/biweekly */}
              {(repeat === 'weekly' || repeat === 'biweekly') && (
                <View style={styles.scheduleRow}>
                  <ThemedText style={styles.scheduleLabel} i18nKey="taskModal.day" />
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
                            { color: scheduleDay === day.value ? '#FFFFFF' : iconColor },
                          ]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Time selector - Optional */}
              <View style={styles.scheduleRow}>
                <ThemedText style={styles.scheduleLabel} i18nKey="taskModal.timeOptional" />
                <TimePicker
                  value={scheduleTime}
                  onChange={handleTimeChange}
                  onClear={handleClearTime}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Icon Picker Modal */}
      <IconPickerModal
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={(iconName) => setSelectedIcon(iconName as TaskIconName)}
        icons={[...TASK_ICON_OPTIONS]}
        selectedIcon={selectedIcon}
        title={t('taskModal.pickIcon')}
      />

      {/* Date Picker Modal */}
      <Modal
        visible={showStartDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStartDatePicker(false)}>
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setShowStartDatePicker(false)}>
          <View style={[styles.datePickerModal, { backgroundColor }]}>
            <View style={styles.datePickerHeader}>
              <ThemedText style={[styles.datePickerTitle, { color: textColor }]}>
                {t('taskModal.startDate')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(false)}
                style={styles.datePickerCloseButton}>
                <CloseIcon size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContent}>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                  textColor={textColor}
                />
              ) : (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.datePickerDoneButton, { backgroundColor: buttonBackgroundColor }]}
                onPress={() => setShowStartDatePicker(false)}>
                <ThemedText style={[styles.datePickerDoneText, { color: buttonTextColor }]}>
                  {t('common.done')}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '300',
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
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
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  repeatButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  repeatButtonTextActive: {
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  icon: {
    marginRight: 0,
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
  dayOfMonthContainer: {
    paddingRight: 16,
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
  },
  scheduleButtonTextActive: {
    fontWeight: '600',
  },
  iconPreviewContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconPreviewTouchable: {
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
  iconPreviewClickable: {
    borderWidth: 3,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconPreviewHint: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
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
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerCloseButton: {
    padding: 4,
  },
  datePickerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  datePickerDoneButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.medium,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

