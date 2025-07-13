import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import Input from './Input';
import { parseDate } from '../../../utils';
import OutsidePressHandler from 'react-native-outside-press';

interface DatePickerProps {
  openDatePicker: boolean;
  setOpenDatePicker: () => void;
  handleChange: (inputIdentifier: string, value: Date) => void;
  inputIdentifier: string;
  invalid: boolean;
  errors: string[];
  value: string | undefined;
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
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
  function handlePressOutside() {
    setOpenDatePicker();
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
            value: value?.toString(),
          }}
        />
      </Pressable>
      {openDatePicker && (
        <OutsidePressHandler onOutsidePress={handlePressOutside}>
          <RNDateTimePicker
            value={value ? parseDate(value) : new Date()}
            minimumDate={minimumDate || new Date()}
            maximumDate={maximumDate || undefined}
            mode='date'
            display='calendar'
            onChange={(event, selectedDate) => {
              if (event.type === 'dismissed') {
                return;
              } else {
                handleChange(inputIdentifier, selectedDate!);
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

export default DatePicker;
