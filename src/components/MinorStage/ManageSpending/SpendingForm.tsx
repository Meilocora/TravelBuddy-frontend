import { ReactElement, useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  Spending,
  SpendingFormValues,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import { formatAmount, formatDate, parseDate } from '../../../utils';
import { createSpending, updateSpending } from '../../../utils/http/spending';
import DatePicker from '../../UI/form/DatePicker';
import SpendingCategorySelector from './SpendingCategorySelector';
import { StagesContext } from '../../../store/stages-context';
import AmountElement from '../../UI/form/Money/AmountElement';

type InputValidationResponse = {
  spending?: Spending;
  spendingFormValues?: SpendingFormValues;
  backendJourneyId?: number;
  error?: string;
  status: number;
};

interface SpendingFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: Spending;
  isEditing?: boolean;
  editSpendingId?: number;
  minorStageId: number;
}

const SpendingForm: React.FC<SpendingFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editSpendingId,
  minorStageId,
}): ReactElement => {
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const stagesCtx = useContext(StagesContext);
  const minorStage = stagesCtx.findMinorStage(minorStageId);

  const minStartDate = minorStage!.scheduled_start_time;
  const maxEndDate = minorStage!.scheduled_end_time;

  const maxAvailableMoney = Math.max(
    Math.round(
      (minorStage!.costs.budget - minorStage!.costs.spent_money) * 100
    ) / 100,
    0
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputs, setInputs] = useState<SpendingFormValues>({
    name: { value: defaultValues?.name || '', isValid: true, errors: [] },
    amount: {
      value: 0,
      isValid: true,
      errors: [],
    },
    unconvertedAmount: {
      value: defaultValues?.amount.toString() || '',
      isValid: true,
      errors: [],
    },
    date: {
      value: defaultValues?.date || '',
      isValid: true,
      errors: [],
    },
    category: {
      value: defaultValues?.category || 'Other',
      isValid: true,
      errors: [],
    },
  });

  // Redefine inputs, when defaultValues change
  useEffect(() => {
    setInputs({
      name: { value: defaultValues?.name || '', isValid: true, errors: [] },
      amount: {
        value: 0,
        isValid: true,
        errors: [],
      },
      unconvertedAmount: {
        value: defaultValues?.amount.toString() || '',
        isValid: true,
        errors: [],
      },
      date: {
        value: defaultValues?.date || '',
        isValid: true,
        errors: [],
      },
      category: {
        value: defaultValues?.category || 'Other',
        isValid: true,
        errors: [],
      },
    });
  }, [defaultValues]);

  function resetValues() {
    setInputs({
      name: { value: '', isValid: true, errors: [] },
      amount: { value: 0, isValid: true, errors: [] },
      unconvertedAmount: { value: '', isValid: true, errors: [] },
      date: { value: '', isValid: true, errors: [] },
      category: { value: 'Other', isValid: true, errors: [] },
    });
  }

  function inputChangedHandler(
    inputIdentifier: string,
    enteredValue: string | boolean | number
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
    for (const key in inputs) {
      inputs[key as keyof SpendingFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      response = await updateSpending(inputs, editSpendingId!, minorStageId);
    } else if (!isEditing) {
      response = await createSpending(inputs, minorStageId);
    }

    const { error, status, spending, spendingFormValues, backendJourneyId } =
      response!;

    if (!error && spending) {
      resetValues();
      onSubmit({ spending, status, backendJourneyId });
    } else if (error) {
      onSubmit({ error, status });
    } else if (spendingFormValues) {
      setInputs((prevValues) => ({
        ...spendingFormValues,
        unconvertedAmount: {
          ...spendingFormValues.unconvertedAmount,
          errors: spendingFormValues.amount.errors,
          isValid: spendingFormValues.amount.isValid,
        },
      }));
    }
    setIsSubmitting(false);
    return;
  }

  if (isSubmitting) {
    const submitButtonLabel = 'Submitting...';
  }

  function handleChangeDate(
    inputIdentifier: string,
    selectedDate: Date | undefined
  ) {
    if (selectedDate === undefined) {
      return;
    }
    const formattedDate = formatDate(new Date(selectedDate));
    setInputs((prevValues) => ({
      ...prevValues,
      [inputIdentifier]: {
        value: formattedDate,
        isValid: true,
        errors: [],
      },
    }));
    setOpenDatePicker(false);
  }

  return (
    <>
      <View style={styles.formContainer}>
        <View>
          <View style={styles.formRow}>
            <Input
              label='Name'
              maxLength={15}
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
            <SpendingCategorySelector
              onChangeSpendingCategory={inputChangedHandler.bind(
                this,
                'category'
              )}
              defaultCategory={inputs.category.value}
              invalid={!inputs.category.isValid}
              errors={inputs.category.errors}
            />
          </View>
          <View style={styles.formRow}>
            <AmountElement
              unconvertedInput={inputs.unconvertedAmount}
              inputChangedHandler={inputChangedHandler}
              maxAmount={maxAvailableMoney}
              field='amount'
            />
          </View>
          <View style={styles.formRow}>
            <View style={styles.rowElement}>
              <DatePicker
                openDatePicker={openDatePicker}
                setOpenDatePicker={() =>
                  setOpenDatePicker((prevValue) => !prevValue)
                }
                handleChange={handleChangeDate}
                inputIdentifier='date'
                invalid={!inputs.date.isValid}
                errors={inputs.date.errors}
                value={inputs.date.value?.toString()}
                label='Date'
                minimumDate={parseDate(minStartDate)}
                maximumDate={parseDate(maxEndDate)}
              />
            </View>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <Button
            onPress={onCancel}
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
          >
            Cancel
          </Button>
          <Button onPress={validateInputs} colorScheme={ColorScheme.neutral}>
            {submitButtonLabel}
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    opacity: 0.75,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: GlobalStyles.colors.gray100,
    backgroundColor: GlobalStyles.colors.gray400,
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
  rowElement: {
    flexBasis: '50%',
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

export default SpendingForm;
