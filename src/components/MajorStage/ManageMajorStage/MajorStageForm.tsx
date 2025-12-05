import { ReactElement, useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  FormLimits,
  MajorStage,
  MajorStageFormValues,
  MajorStageValues,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import {
  addDaysToDateString,
  formatAmount,
  formatDate,
  generateRandomString,
  parseDate,
} from '../../../utils';
import Modal from '../../UI/Modal';
import CountrySelector from './CountrySelector';
import { createMajorStage, updateMajorStage } from '../../../utils/http';
import { StagesContext } from '../../../store/stages-context';
import PositionSelector from '../../UI/form/PositionSelector';
import ExpoDatePicker from '../../UI/form/ExpoDatePicker';

type InputValidationResponse = {
  majorStage?: MajorStage;
  majorStageFormValues?: MajorStageFormValues;
  error?: string;
  status: number;
};

interface MajorStageFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: MajorStageValues;
  isEditing?: boolean;
  editMajorStageId?: number;
  journeyId: number;
}

const MajorStageForm: React.FC<MajorStageFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editMajorStageId,
  journeyId,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);
  const journey = stagesCtx.findJourney(journeyId);

  let maxAvailableMoney = journey!.costs.budget;
  const majorStages = journey!.majorStages;
  majorStages?.forEach((ms) => {
    maxAvailableMoney -= ms.costs.budget;
  });

  let positions: number[];
  if (defaultValues?.position) {
    positions = Array.from(
      { length: majorStages?.length ?? 0 }, // if no stages -> length = 1
      (_, i) => i + 1
    );
  } else {
    positions = Array.from(
      { length: (majorStages?.length ?? 0) + 1 }, // if no stages -> length = 1
      (_, i) => i + 1
    );
  }
  const initialPosition = isEditing
    ? defaultValues?.position ?? 1
    : positions[positions.length - 1];

  const minStartDate = journey!.scheduled_start_time;
  const priorMajorStage = majorStages?.find(
    (stage) => stage.position === initialPosition - 1
  );

  const initialStartTimeValue = defaultValues
    ? defaultValues.scheduled_start_time
    : priorMajorStage
    ? addDaysToDateString(priorMajorStage.scheduled_end_time)
    : null;
  const initialEndTimeValue = defaultValues
    ? defaultValues.scheduled_end_time
    : priorMajorStage
    ? addDaysToDateString(priorMajorStage.scheduled_end_time)
    : null;

  const maxEndDate = journey!.scheduled_end_time;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeCountry, setChangeCountry] = useState(false);
  const [updateConfirmed, setUpdateConfirmed] = useState(false);

  const [inputs, setInputs] = useState<MajorStageFormValues>({
    title: { value: defaultValues?.title || '', isValid: true, errors: [] },
    scheduled_start_time: {
      value: initialStartTimeValue,
      isValid: true,
      errors: [],
    },
    scheduled_end_time: {
      value: initialEndTimeValue,
      isValid: true,
      errors: [],
    },
    additional_info: {
      value: defaultValues?.additional_info || '',
      isValid: true,
      errors: [],
    },
    budget: {
      value: defaultValues?.budget || 0,
      isValid: true,
      errors: [],
    },
    spent_money: {
      value: defaultValues?.spent_money || 0,
      isValid: true,
      errors: [],
    },
    country: {
      value: defaultValues?.country || '',
      isValid: true,
      errors: [],
    },
    position: {
      value: initialPosition,
      isValid: true,
      errors: [],
    },
  });

  function inputChangedHandler(
    inputIdentifier: string,
    enteredValue: string | number | boolean
  ) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  function handleChangeCountry(countryName: string) {
    setInputs((prevValues) => {
      return {
        ...prevValues,
        country: {
          value: countryName,
          isValid: true,
          errors: [],
        },
      };
    });
  }

  async function validateInputs(): Promise<void> {
    setIsSubmitting(true);

    // Set all errors to empty array to prevent stacking of errors
    for (const key in inputs) {
      inputs[key as keyof MajorStageFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      const former_country = stagesCtx.findMajorStage(editMajorStageId!)!
        .country.name;

      if (!updateConfirmed && inputs.country.value !== former_country) {
        setChangeCountry(true);
        return;
      }
      response = await updateMajorStage(journeyId, inputs, editMajorStageId!);
    } else if (!isEditing) {
      response = await createMajorStage(journeyId, inputs);
    }

    const { error, status, majorStage, majorStageFormValues } = response!;

    if (!error && majorStage) {
      onSubmit({ majorStage, status });
    } else if (error) {
      onSubmit({ error, status });
    } else if (majorStageFormValues) {
      setInputs((prevValues) => majorStageFormValues);
    }
    setIsSubmitting(false);
    return;
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
  }

  function confirmModalHandler() {
    setChangeCountry(false);
    setUpdateConfirmed(true);
    validateInputs();
  }

  function closeModalHandler() {
    setChangeCountry(false);
  }

  return (
    <>
      {changeCountry && (
        <Modal
          title='Are you sure?'
          content={`When you change the country, all Minor Stages that are connected to ${inputs.title.value} will be deleted.`}
          confirmText='Change'
          onConfirm={confirmModalHandler}
          onCancel={closeModalHandler}
        />
      )}
      <View style={styles.formContainer}>
        <View>
          <View style={styles.formRow}>
            <View style={styles.titleWrapper}>
              <Input
                label='Title'
                maxLength={FormLimits.majorStageTitle}
                invalid={!inputs.title.isValid}
                errors={inputs.title.errors}
                mandatory
                textInputConfig={{
                  value: inputs.title.value,
                  onChangeText: inputChangedHandler.bind(this, 'title'),
                }}
              />
            </View>
            <View style={styles.positionWrapper}>
              <PositionSelector
                defaultPosition={inputs.position.value}
                errors={inputs.position.errors}
                invalid={!inputs.position.isValid}
                onChangePosition={(newPosition: number) =>
                  inputChangedHandler('position', newPosition)
                }
                positions={positions}
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <Input
              label='Additional Information'
              maxLength={FormLimits.majorStageAdditionalInfos}
              invalid={!inputs.additional_info.isValid}
              errors={inputs.additional_info.errors}
              textInputConfig={{
                multiline: true,
                value: inputs.additional_info.value,
                onChangeText: inputChangedHandler.bind(this, 'additional_info'),
              }}
            />
          </View>
          <View style={styles.formRow}>
            <Input
              label='Spent Money'
              maxLength={0}
              invalid={!inputs.spent_money.isValid}
              textInputConfig={{
                readOnly: true,
                placeholder: formatAmount(inputs.spent_money.value),
              }}
            />
            <Input
              label='Budget'
              maxLength={6}
              invalid={!inputs.budget.isValid}
              errors={inputs.budget.errors}
              textInputConfig={{
                keyboardType: 'decimal-pad',
                value:
                  inputs.budget.value !== 0
                    ? inputs.budget.value.toString()
                    : '',
                onChangeText: inputChangedHandler.bind(this, 'budget'),
                placeholder: `Max: ${formatAmount(maxAvailableMoney)}`,
              }}
            />
          </View>
          <View style={styles.formRow}>
            <ExpoDatePicker
              handleChange={handleChangeDate}
              inputIdentifier='scheduled_start_time'
              invalid={!inputs.scheduled_start_time.isValid}
              errors={inputs.scheduled_start_time.errors}
              value={inputs.scheduled_start_time.value?.toString()}
              label='Starts on'
              minimumDate={parseDate(minStartDate)}
              maximumDate={
                inputs.scheduled_end_time.value
                  ? parseDate(inputs.scheduled_end_time.value)
                  : parseDate(maxEndDate)
              }
            />
            <ExpoDatePicker
              handleChange={handleChangeDate}
              inputIdentifier='scheduled_end_time'
              invalid={!inputs.scheduled_end_time.isValid}
              errors={inputs.scheduled_end_time.errors}
              value={inputs.scheduled_end_time.value?.toString()}
              label='Ends on'
              minimumDate={
                inputs.scheduled_start_time.value
                  ? parseDate(inputs.scheduled_start_time.value)
                  : parseDate(minStartDate)
              }
              maximumDate={parseDate(maxEndDate)}
            />
          </View>
          <View style={styles.formRow}>
            <CountrySelector
              key={
                isEditing ? String(editMajorStageId) : generateRandomString()
              }
              onChangeCountry={handleChangeCountry}
              errors={inputs.country.errors}
              invalid={false}
              journeyId={journeyId}
              defaultCountryName={inputs.country.value}
            />
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
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: GlobalStyles.colors.grayMedium,
    backgroundColor: GlobalStyles.colors.amberSoft,
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
  titleWrapper: {
    flex: 4, // 75% of the row (3 parts)
  },
  positionWrapper: {
    flex: 1, // 25% of the row (1 part)
    justifyContent: 'center', // vertically center if PositionSelector has fixed height
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

export default MajorStageForm;
