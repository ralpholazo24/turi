import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  onClear?: () => void;
}

export function TimePicker({ value, onChange, onClear }: TimePickerProps) {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: '#E0E0E0', dark: '#404040' },
    'icon'
  );

  const ClockIcon = APP_ICONS.clock;
  const XIcon = APP_ICONS.close;
  const CloseIcon = APP_ICONS.close;

  // Parse value to Date object
  const getDateFromValue = (timeString: string): Date => {
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      }
    }
    // Default to 9:00 AM if no value
    const defaultDate = new Date();
    defaultDate.setHours(9, 0, 0, 0);
    return defaultDate;
  };

  const [selectedTime, setSelectedTime] = useState<Date>(getDateFromValue(value));
  const [showPicker, setShowPicker] = useState(false);

  // Update selectedTime when value changes
  useEffect(() => {
    if (value) {
      setSelectedTime(getDateFromValue(value));
    }
  }, [value]);

  const handleTimeChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedTime(date);
      // On Android, auto-close and save
      if (Platform.OS === 'android' && event.type === 'set') {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        onChange(timeString);
        setShowPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const handleDone = () => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    onChange(timeString);
    setShowPicker(false);
  };

  const formatTimeDisplay = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? t('common.pm') : t('common.am');
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleClear = (e: any) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.timeButton, { backgroundColor, borderColor }]}
        onPress={handlePress}>
        <ClockIcon size={20} color={textColor} style={styles.icon} />
        <ThemedText style={[styles.timeText, { color: value ? textColor : textColor + '80' }]}>
          {value ? formatTimeDisplay(selectedTime) : t('timePicker.selectTime')}
        </ThemedText>
        {value && onClear && (
          <TouchableOpacity
            style={styles.clearIconButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={[styles.clearIconContainer, { backgroundColor: iconColor + '20' }]}>
              <XIcon size={14} color={iconColor} />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}>
          <View style={[styles.timePickerModal, { backgroundColor }]}>
            <View style={styles.timePickerHeader}>
              <ThemedText style={[styles.timePickerTitle, { color: textColor }]}>
                {t('timePicker.selectTimeTitle')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={styles.timePickerCloseButton}>
                <CloseIcon size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerContent}>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) {
                      setSelectedTime(date);
                    }
                  }}
                  textColor={textColor}
                />
              ) : (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.timePickerDoneButton, { backgroundColor: textColor }]}
                onPress={handleDone}>
                <Text style={[styles.timePickerDoneText, { color: backgroundColor }]}>
                  {t('common.done')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 50,
    position: 'relative',
  },
  icon: {
    marginRight: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  clearIconButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIconContainer: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circular.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timePickerModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timePickerCloseButton: {
    padding: 4,
  },
  timePickerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  timePickerDoneButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.medium,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
