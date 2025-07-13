import React, { useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import Input from './Input';
import { formatDate, parseDate, parseDateAndTime } from '../../../utils';
import OutsidePressHandler from 'react-native-outside-press';

interface PickerValues {
  inputIdentifier: string;
  selectedDate: Date | undefined;
}

interface DatePickerProps {
  openDatePicker: boolean;
  setOpenDatePicker: () => void;
  handleChange: (inputIdentifier: string, value: string) => void;
  inputIdentifier: string;
  invalid: boolean;
  errors: string[];
  value: string | undefined;
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DateTimePicker: React.FC<DatePickerProps> = ({
  openDatePicker,
  setOpenDatePicker,
  handleChange,
  inputIdentifier,
  invalid,
  errors,
  value,
  label,
  minimumDate,
  maximumDate,
}) => {
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  function handleChooseDate({ inputIdentifier, selectedDate }: PickerValues) {
    if (selectedDate === undefined) {
      setOpenDatePicker();
      setOpenTimePicker(false);
      return;
    }
    setFormattedDate(formatDate(new Date(selectedDate)));
    setOpenTimePicker(true);
  }

  function handleChooseTime({ inputIdentifier, selectedDate }: PickerValues) {
    if (selectedDate === undefined) {
      setOpenTimePicker(false);
      return;
    }
    const formattedTime = selectedDate?.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setOpenTimePicker(false);
    const responseDate = `${formattedDate} ${formattedTime}`;
    handleChange(inputIdentifier, responseDate);
  }

  function handlePressOutside() {
    setOpenDatePicker();
    setOpenTimePicker(false);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={setOpenDatePicker}>
        <Input
          label={label}
          maxLength={100}
          invalid={invalid}
          errors={errors}
          mandatory
          textInputConfig={{
            placeholder: 'Choose Date',
            readOnly: true,
            value: value,
          }}
        />
      </Pressable>
      {openDatePicker && !openTimePicker && (
        <OutsidePressHandler onOutsidePress={handlePressOutside}>
          <RNDateTimePicker
            value={value ? parseDate(value) : new Date()}
            minimumDate={minimumDate || new Date()}
            maximumDate={maximumDate || undefined}
            mode='date'
            display='calendar'
            onTouchCancel={handlePressOutside}
            onChange={(event, selectedDate) => {
              if (event.type === 'dismissed') {
                return;
              } else {
                handleChooseDate({ inputIdentifier, selectedDate });
              }
            }}
          />
        </OutsidePressHandler>
      )}
      {openDatePicker && openTimePicker && (
        <OutsidePressHandler onOutsidePress={handlePressOutside}>
          <RNDateTimePicker
            value={value ? parseDateAndTime(value) : new Date()}
            minimumDate={minimumDate || new Date()}
            maximumDate={maximumDate || undefined}
            mode='time'
            display='spinner'
            onTouchCancel={handlePressOutside}
            onChange={(event, selectedDate) => {
              if (event.type === 'dismissed') {
                return;
              } else {
                handleChooseTime({ inputIdentifier, selectedDate });
              }
            }}
          />
        </OutsidePressHandler>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DateTimePicker;
