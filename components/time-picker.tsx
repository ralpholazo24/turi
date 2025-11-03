import { ThemedText } from '@/components/themed-text';
import { BORDER_RADIUS } from '@/constants/border-radius';
import { APP_ICONS } from '@/constants/icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      setSelectedTime(date);
      onChange(timeString);
      
      // On iOS, dismiss after selection
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
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

      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showPicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowPicker(false)}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  activeOpacity={1}
                  onPress={() => setShowPicker(false)}
                />
                <View style={[styles.modalContent, { backgroundColor }]}>
                  <View style={[styles.modalHeader, { borderBottomColor: borderColor + '30' }]}>
                    <TouchableOpacity
                      onPress={() => setShowPicker(false)}
                      style={styles.cancelButton}>
                      <ThemedText style={[styles.cancelButtonText, { color: iconColor }]} i18nKey="timePicker.cancel" />
                    </TouchableOpacity>
                    <ThemedText style={styles.modalTitle} i18nKey="timePicker.selectTimeTitle" />
                    <TouchableOpacity
                      onPress={() => {
                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                        onChange(`${hours}:${minutes}`);
                        setShowPicker(false);
                      }}
                      style={styles.doneButton}>
                      <ThemedText style={styles.doneButtonText} i18nKey="timePicker.done" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.pickerWrapper}>
                    <View style={styles.pickerContainer}>
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
                        style={styles.picker}
                        textColor={textColor}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xlarge,
    paddingBottom: 20,
    paddingHorizontal: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 8,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  picker: {
    height: 200,
    width: '100%',
    alignSelf: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -20, // Compensate for iOS picker's default padding
  },
});
