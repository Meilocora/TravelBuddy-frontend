import React, { useMemo, useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import Input from './Input';
import { formatDate, parseDateAndTime } from '../../../utils';

interface ExpoDateTimePickerProps {
  handleChange: (inputIdentifier: string, value: string) => void;
  inputIdentifier: string;
  invalid: boolean;
  errors: string[];
  value: string | undefined;
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const ExpoDateTimePicker: React.FC<ExpoDateTimePickerProps> = ({
  handleChange,
  inputIdentifier,
  invalid,
  errors,
  value,
  label,
  minimumDate,
  maximumDate,
}) => {
  const [openDateTimePicker, setOpenDateTimePicker] = useState(false);

  const initialDate = useMemo(
    () => (value ? parseDateAndTime(value) : new Date()),
    [value]
  );

  function onConfirm(picked: Date) {
    // Close first ... workaround for opening again by itself
    setOpenDateTimePicker(false);
    // Datumsteil mit deinem Helper
    const datePart = formatDate(new Date(picked));
    // 24h-Zeit wie bisher
    const timePart = picked.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    handleChange(inputIdentifier, `${datePart} ${timePart}`);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setOpenDateTimePicker(true)}>
        <Input
          label={label}
          maxLength={100}
          invalid={invalid}
          errors={errors}
          mandatory
          textInputConfig={{
            placeholder: 'Choose Date',
            editable: false,
            value: value,
          }}
        />
      </Pressable>
      <DateTimePickerModal
        isVisible={openDateTimePicker}
        mode='datetime'
        date={initialDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        is24Hour
        onCancel={() => setOpenDateTimePicker(false)}
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

export default ExpoDateTimePicker;
