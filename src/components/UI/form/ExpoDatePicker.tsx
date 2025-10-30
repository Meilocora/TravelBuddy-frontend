import React, { useMemo, useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import Input from './Input';
import { parseDate } from '../../../utils';

interface ExpoDatePickerProps {
  handleChange: (inputIdentifier: string, value: Date) => void;
  inputIdentifier: string;
  invalid: boolean;
  errors: string[];
  value: string | undefined;
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const ExpoDatePicker: React.FC<ExpoDatePickerProps> = ({
  handleChange,
  inputIdentifier,
  invalid,
  errors,
  value,
  label,
  minimumDate,
  maximumDate,
}) => {
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const initialDate = useMemo(
    () => (value ? parseDate(value) : new Date()),
    [value]
  );

  function onConfirm(picked: Date) {
    // Close first ... workaround for opening again by itself
    setOpenDatePicker(false);
    handleChange(inputIdentifier, picked);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setOpenDatePicker(true)}>
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
      <DateTimePickerModal
        isVisible={openDatePicker}
        mode='date'
        display='calendar'
        date={initialDate}
        minimumDate={minimumDate || new Date()}
        maximumDate={maximumDate || undefined}
        is24Hour
        onCancel={() => setOpenDatePicker(false)}
        onConfirm={onConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ExpoDatePicker;
