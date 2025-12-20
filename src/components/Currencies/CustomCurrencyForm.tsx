import { ReactElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import Button from '../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  CustomCurrencyFormValues,
  CustomCurrencyValues,
  FormLimits,
} from '../../models';
import Input from '../UI/form/Input';
import {
  addCurrency,
  ManageCurrencyProps,
  updateCurrency,
} from '../../utils/http/currency';

interface CustomCurrencyFormProps {
  onCancel: () => void;
  onSubmit: (response: ManageCurrencyProps) => void;
  submitButtonLabel: string;
  defaultValues?: CustomCurrencyValues;
  isEditing?: boolean;
  editCurrencyId?: number;
}

const CustomCurrencyForm: React.FC<CustomCurrencyFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editCurrencyId,
}): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputs, setInputs] = useState<CustomCurrencyFormValues>({
    code: { value: defaultValues?.code || '', isValid: true, errors: [] },
    name: { value: defaultValues?.name || '', isValid: true, errors: [] },
    symbol: { value: defaultValues?.symbol || '', isValid: true, errors: [] },
    conversionRate: {
      value: defaultValues?.conversionRate || 1,
      isValid: true,
      errors: [],
    },
  });

  function inputChangedHandler(
    inputIdentifier: string,
    enteredValue: string | number
  ) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  async function validateInputs(): Promise<void> {
    setIsSubmitting(true);

    // Set all errors to empty array to prevent stacking of errors
    const updatedInputs = { ...inputs };
    for (const key in updatedInputs) {
      updatedInputs[key as keyof CustomCurrencyFormValues].errors = [];
    }
    updatedInputs.conversionRate = {
      ...updatedInputs.conversionRate,
      value: 1 / updatedInputs.conversionRate.value,
    };

    let response: ManageCurrencyProps;
    if (isEditing) {
      response = await updateCurrency(updatedInputs, editCurrencyId!);
    } else if (!isEditing) {
      response = await addCurrency(updatedInputs);
    }

    const { error, status, currencyFormValues } = response!;

    if (!error) {
      onSubmit({ status });
    } else if (error) {
      onSubmit({ error, status });
    } else if (currencyFormValues) {
      setInputs((prevValues) => ({
        ...currencyFormValues,
      }));
    }
    setIsSubmitting(false);
    return;
  }

  return (
    <>
      <View style={styles.formContainer}>
        <View>
          <View style={styles.formRow}>
            <Input
              label='Name'
              maxLength={FormLimits.currencyName}
              invalid={!inputs.name.isValid}
              errors={inputs.name.errors}
              mandatory
              textInputConfig={{
                value: inputs.name.value,
                onChangeText: inputChangedHandler.bind(this, 'name'),
              }}
            />
          </View>
          <View style={styles.formRow}>
            <Input
              label='Code'
              maxLength={FormLimits.currencyCode}
              invalid={!inputs.code.isValid}
              errors={inputs.code.errors}
              mandatory
              textInputConfig={{
                value: inputs.code.value,
                onChangeText: inputChangedHandler.bind(this, 'code'),
              }}
            />
            <Input
              label='Symbol'
              maxLength={FormLimits.currencySymbol}
              invalid={!inputs.symbol.isValid}
              errors={inputs.symbol.errors}
              mandatory
              textInputConfig={{
                value: inputs.symbol.value,
                onChangeText: inputChangedHandler.bind(this, 'symbol'),
              }}
            />
          </View>
        </View>
        <View style={styles.formRow}>
          <Input
            label='Conversion Rate (to 1€)'
            maxLength={6}
            invalid={!inputs.conversionRate.isValid}
            errors={inputs.conversionRate.errors}
            mandatory
            textInputConfig={{
              keyboardType: 'decimal-pad',
              value:
                inputs.conversionRate.value !== 0
                  ? inputs.conversionRate.value.toString()
                  : '',
              onChangeText: inputChangedHandler.bind(this, 'conversionRate'),
            }}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button
            onPress={onCancel}
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
          >
            Cancel
          </Button>
          <Button
            onPress={validateInputs}
            colorScheme={ColorScheme.neutral}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : submitButtonLabel}
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginHorizontal: 16,
    marginTop: '25%',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: GlobalStyles.colors.grayMedium,
    backgroundColor: GlobalStyles.colors.purpleSoft,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginHorizontal: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '50%',
    marginVertical: 8,
    marginHorizontal: 'auto',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default CustomCurrencyForm;
