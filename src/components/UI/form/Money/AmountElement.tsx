import { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import Input from '../Input';
import { formatAmount } from '../../../../utils';
import CurrencyPicker from './CurrencyPicker';

interface AmountElementProps {
  unconvertedInput: {
    isValid: boolean;
    errors: string[];
    value: string;
  };
  maxAmount?: number;
  field: string;
  inputChangedHandler: (
    inputIdentifier: string,
    enteredValue: string | number
  ) => void;
}

const AmountElement: React.FC<AmountElementProps> = ({
  unconvertedInput,
  maxAmount = 0,
  field,
  inputChangedHandler,
}): ReactElement => {
  return (
    <View style={styles.container}>
      <Input
        label='Amount'
        maxLength={12}
        invalid={!unconvertedInput.isValid}
        errors={unconvertedInput.errors}
        textInputConfig={{
          keyboardType: 'decimal-pad',
          value: unconvertedInput.value!.toString(),
          onChangeText: (text) =>
            inputChangedHandler('unconvertedAmount', text),
          placeholder: maxAmount > 0 ? `Max: ${formatAmount(maxAmount)}` : '',
        }}
      />
      <CurrencyPicker
        unconvertedValue={unconvertedInput.value}
        style={{ flexGrow: 1.5 }}
        inputChangedHandler={inputChangedHandler}
        field={field}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default AmountElement;
