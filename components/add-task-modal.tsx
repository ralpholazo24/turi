import { MemberAvatar } from '@/components/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { TimePicker } from '@/components/time-picker';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { TASK_ICON_OPTIONS, type TaskIconName } from '@/constants/icons-task-member';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppStore } from '@/store/use-app-store';
import { Group } from '@/types';
import { isSoloMode } from '@/utils/solo-mode';
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

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onOpenAddMember?: () => void; // Callback to open Add Member modal
}

export function AddTaskModal({ visible, onClose, group, onOpenAddMember }: AddTaskModalProps) {
  const { t } = useTranslation();
  const { addTask } = useAppStore();
  const [taskName, setTaskName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<TaskIconName>('Trash2');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showNoMembersModal, setShowNoMembersModal] = useState(false);
  
  // Scheduling options
  const [scheduleWeek, setScheduleWeek] = useState<number | undefined>(undefined); // 1-4 for monthly
  const [scheduleDay, setScheduleDay] = useState<number | undefined>(undefined); // 0-6
  const [scheduleTime, setScheduleTime] = useState<string>(''); // HH:MM format

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
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
    { value: 0, label: t('task.sunday') },
    { value: 1, label: t('task.monday') },
    { value: 2, label: t('task.tuesday') },
    { value: 3, label: t('task.wednesday') },
    { value: 4, label: t('task.thursday') },
    { value: 5, label: t('task.friday') },
    { value: 6, label: t('task.saturday') },
  ];
  
  // Weeks of the month
  const WEEKS = [
    { value: 1, label: t('task.firstWeek') },
    { value: 2, label: t('task.secondWeek') },
    { value: 3, label: t('task.thirdWeek') },
    { value: 4, label: t('task.fourthWeek') },
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

  // Initialize with all members selected by default
  useEffect(() => {
    if (visible && group.members.length > 0) {
      // In solo mode, automatically select the solo member
      if (isSoloMode(group)) {
        setSelectedMembers(new Set([group.members[0].id]));
      } else {
        setSelectedMembers(new Set(group.members.map((m) => m.id)));
      }
    }
  }, [visible, group.members]);

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
    // Check if group has no members
    if (group.members.length === 0) {
      setShowNoMembersModal(true);
      return;
    }

    // In solo mode, automatically assign to the solo member
    const finalSelectedMembers = isSoloMode(group) 
      ? new Set([group.members[0].id])
      : selectedMembers;

    if (!taskName.trim() || finalSelectedMembers.size === 0) {
      return;
    }

    // Validate time if provided
    if (scheduleTime && !validateTime(scheduleTime)) {
      return;
    }

    await addTask(group.id, {
      name: taskName.trim(),
      icon: selectedIcon,
      frequency,
      assignedIndex: 0,
      memberIds: Array.from(finalSelectedMembers),
      lastCompletedAt: null,
      completionHistory: [],
      skipHistory: [],
      scheduleWeek: frequency === 'monthly' ? scheduleWeek : undefined,
      scheduleDay: (frequency === 'weekly' || frequency === 'monthly') ? scheduleDay : undefined,
      scheduleTime: scheduleTime || undefined,
    });

    // Reset form
    setTaskName('');
    setSelectedIcon('Trash2');
    setFrequency('daily');
    if (isSoloMode(group)) {
      setSelectedMembers(new Set([group.members[0].id]));
    } else {
      setSelectedMembers(new Set(group.members.map((m) => m.id)));
    }
    setScheduleWeek(undefined);
    setScheduleDay(undefined);
    setScheduleTime('');
    onClose();
  };

  const handleAddMembers = () => {
    setShowNoMembersModal(false);
    onClose();
    onOpenAddMember?.();
  };

  const handleClose = () => {
    setTaskName('');
    setSelectedIcon('Trash2');
    setFrequency('daily');
    setSelectedMembers(new Set());
    setScheduleWeek(undefined);
    setScheduleDay(undefined);
    setScheduleTime('');
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
            <ThemedText type="subtitle" style={styles.headerTitle} i18nKey="group.addTask" />
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Task Icon Preview */}
            <View style={styles.section}>
              <View style={styles.iconPreviewContainer}>
                <View style={[styles.iconPreview, { backgroundColor: borderColor + '40' }]}>
                  {/* eslint-disable-next-line import/namespace */}
                  {(() => {
                    const IconComponent = LucideIcons[selectedIcon] as React.ComponentType<{ size?: number; color?: string }>;
                    return IconComponent ? <IconComponent size={48} color={textColor} /> : null;
                  })()}
                </View>
              </View>
            </View>

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

            {/* Frequency Selector */}
            <View style={styles.section}>
              <ThemedText style={styles.label} i18nKey="taskModal.howOften" />
              <View style={styles.frequencyContainer}>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'daily' && styles.frequencyButtonActive,
                    { backgroundColor: frequency === 'daily' ? '#10B981' : borderColor + '30' },
                  ]}
                  onPress={() => setFrequency('daily')}>
                  <CalendarIcon size={20} color={frequency === 'daily' ? '#FFFFFF' : iconColor} />
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === 'daily' && styles.frequencyTextActive,
                      { color: frequency === 'daily' ? '#FFFFFF' : iconColor },
                    ]}>
                    {t('task.daily')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'weekly' && styles.frequencyButtonActive,
                    { backgroundColor: frequency === 'weekly' ? '#10B981' : borderColor + '30' },
                  ]}
                  onPress={() => setFrequency('weekly')}>
                  <CalendarIcon size={20} color={frequency === 'weekly' ? '#FFFFFF' : iconColor} />
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === 'weekly' && styles.frequencyTextActive,
                      { color: frequency === 'weekly' ? '#FFFFFF' : iconColor },
                    ]}>
                    {t('task.weekly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'monthly' && styles.frequencyButtonActive,
                    { backgroundColor: frequency === 'monthly' ? '#10B981' : borderColor + '30' },
                  ]}
                  onPress={() => setFrequency('monthly')}>
                  <CalendarIcon size={20} color={frequency === 'monthly' ? '#FFFFFF' : iconColor} />
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === 'monthly' && styles.frequencyTextActive,
                      { color: frequency === 'monthly' ? '#FFFFFF' : iconColor },
                    ]}>
                    {t('task.monthly')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scheduling Options */}
            <View style={styles.section}>
              <ThemedText style={styles.label} i18nKey="taskModal.schedule" />
              
              {/* Week selector for monthly */}
              {frequency === 'monthly' && (
                <View style={styles.scheduleRow}>
                  <ThemedText style={styles.scheduleLabel} i18nKey="taskModal.week" />
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
                            { color: scheduleWeek === week.value ? '#FFFFFF' : iconColor },
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

              {/* Time selector - Optional for all frequencies */}
              <View style={styles.scheduleRow}>
                <ThemedText style={styles.scheduleLabel} i18nKey="taskModal.timeOptional" />
                <TimePicker
                  value={scheduleTime}
                  onChange={handleTimeChange}
                  onClear={handleClearTime}
                />
              </View>
            </View>

            {/* Icon Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label} i18nKey="taskModal.pickIcon" />
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
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!taskName.trim() || (!isSoloMode(group) && selectedMembers.size === 0) || group.members.length === 0) && styles.saveButtonDisabled,
                { backgroundColor: '#10B981' },
              ]}
              onPress={handleSave}
              disabled={!taskName.trim() || (!isSoloMode(group) && selectedMembers.size === 0) || group.members.length === 0}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* No Members Modal */}
      <Modal
        visible={showNoMembersModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNoMembersModal(false)}>
        <View style={styles.noMembersModalContainer}>
          <View style={styles.noMembersModalBackdrop} />
          <View style={[styles.noMembersModalContent, { backgroundColor, borderColor: borderColor + '30' }]}>
            <ThemedText type="subtitle" style={styles.noMembersTitle} i18nKey="taskModal.noMembersYet" />
            <ThemedText style={styles.noMembersMessage} i18nKey="taskModal.noMembersYetMessage" />
            <View style={styles.noMembersButtons}>
              <TouchableOpacity
                style={[styles.noMembersButton, styles.cancelButton, { borderColor }]}
                onPress={() => setShowNoMembersModal(false)}
                activeOpacity={0.7}>
                <ThemedText style={styles.cancelButtonText} i18nKey="common.cancel" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.noMembersButton, styles.addMembersButton]}
                onPress={handleAddMembers}
                activeOpacity={0.7}>
                <Text style={styles.addMembersButtonText}>{t('taskModal.addMembers')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  },
  frequencyTextActive: {
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
  },
  scheduleButtonTextActive: {
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
  noMembersModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMembersModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noMembersModalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xlarge,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noMembersTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  noMembersMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  noMembersButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  noMembersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addMembersButton: {
    backgroundColor: '#10B981',
  },
  addMembersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

