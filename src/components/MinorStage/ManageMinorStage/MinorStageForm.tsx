import { ReactElement, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

import {
  ButtonMode,
  ColorScheme,
  FormLimits,
  MapLocation,
  MinorStage,
  MinorStageFormValues,
  MinorStageValues,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import {
  createMinorStage,
  formatAmount,
  formatDate,
  parseDate,
  updateMinorStage,
} from '../../../utils';
import LocationPicker from '../../UI/form/LocationPicker';
import { StagesContext } from '../../../store/stages-context';
import AmountElement from '../../UI/form/Money/AmountElement';
import ExpoDatePicker from '../../UI/form/ExpoDatePicker';
import PositionSelector from '../../UI/form/PositionSelector';

type InputValidationResponse = {
  minorStage?: MinorStage;
  minorStageFormValues?: MinorStageFormValues;
  error?: string;
  status: number;
};

interface MinorStageFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: MinorStageValues;
  isEditing?: boolean;
  editMinorStageId?: number;
  majorStageId: number;
}

const MinorStageForm: React.FC<MinorStageFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editMinorStageId,
  majorStageId,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);
  const majorStage = stagesCtx.findMajorStage(majorStageId);

  const minStartDate = majorStage!.scheduled_start_time;
  const maxEndDate = majorStage!.scheduled_end_time;
  let maxAvailableMoney = majorStage!.costs.budget;

  const minorStages = majorStage!.minorStages;
  minorStages?.forEach((ms) => {
    maxAvailableMoney -= ms.costs.budget;
  });

  let positions: number[];
  if (defaultValues?.position) {
    positions = Array.from(
      { length: minorStages?.length ?? 0 }, // if no stages -> length = 1
      (_, i) => i + 1
    );
  } else {
    positions = Array.from(
      { length: (minorStages?.length ?? 0) + 1 }, // if no stages -> length = 1
      (_, i) => i + 1
    );
  }
  const initialPosition = isEditing
    ? defaultValues?.position ?? 1
    : positions[positions.length - 1];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputs, setInputs] = useState<MinorStageFormValues>({
    title: { value: defaultValues?.title || '', isValid: true, errors: [] },
    scheduled_start_time: {
      value: defaultValues?.scheduled_start_time || null,
      isValid: true,
      errors: [],
    },
    scheduled_end_time: {
      value: defaultValues?.scheduled_end_time || null,
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
    accommodation_place: {
      value: defaultValues?.accommodation_place || '',
      isValid: true,
      errors: [],
    },
    accommodation_costs: {
      value: 0,
      isValid: true,
      errors: [],
    },
    unconvertedAmount: {
      value: defaultValues?.accommodation_costs.toString() || '',
      isValid: true,
      errors: [],
    },
    accommodation_booked: {
      value: defaultValues?.accommodation_booked || false,
      isValid: true,
      errors: [],
    },
    accommodation_latitude: {
      value: defaultValues?.accommodation_latitude || undefined,
      isValid: true,
      errors: [],
    },
    accommodation_longitude: {
      value: defaultValues?.accommodation_longitude || undefined,
      isValid: true,
      errors: [],
    },
    accommodation_link: {
      value: defaultValues?.accommodation_link || '',
      isValid: true,
      errors: [],
    },
    position: {
      value: initialPosition,
      isValid: true,
      errors: [],
    },
  });

  const [maxAvailableMoneyAccommodation, setMaxAvailableMoneyAccommodation] =
    useState(Math.max(0, inputs.budget.value));
  useEffect(() => {
    setMaxAvailableMoneyAccommodation(Math.max(0, inputs.budget.value));

    setInputs((prevValues) => {
      return {
        ...prevValues,
        accommodation_costs: {
          value: prevValues.accommodation_costs.value,
          isValid: true,
          errors: [],
        },
      };
    });
  }, [inputs.budget.value]);

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

  function handlePickLocation(location: MapLocation) {
    if (location.title) {
      setInputs((currInputs) => {
        return {
          ...currInputs,
          accommodation_place: {
            value: location.title!,
            isValid: true,
            errors: [],
          },
        };
      });
    }
    setInputs((currInputs) => {
      return {
        ...currInputs,
        accommodation_latitude: {
          value: location.lat,
          isValid: true,
          errors: [],
        },
        accommodation_longitude: {
          value: location.lng,
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
      inputs[key as keyof MinorStageFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      response = await updateMinorStage(
        majorStageId,
        inputs,
        editMinorStageId!
      );
    } else if (!isEditing) {
      response = await createMinorStage(majorStageId, inputs);
    }

    const { error, status, minorStage, minorStageFormValues } = response!;

    if (!error && minorStage) {
      onSubmit({ minorStage, status });
    } else if (error) {
      onSubmit({ error, status });
    } else if (minorStageFormValues) {
      setInputs((prevValues) => ({
        ...minorStageFormValues,
        unconvertedAmount: {
          ...minorStageFormValues.unconvertedAmount,
          errors: minorStageFormValues.accommodation_costs.errors,
          isValid: minorStageFormValues.accommodation_costs.isValid,
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
  }

  return (
    <>
      <View style={styles.formContainer}>
        <View>
          <View style={styles.formRow}>
            <View style={styles.titleWrapper}>
              <Input
                label='Title'
                maxLength={FormLimits.minorStageTitle}
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
                colorScheme={ColorScheme.complementary}
              />
            </View>
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
          <View style={styles.separator}>
            <Text style={styles.subtitle}>Accommodation</Text>
          </View>
          <View style={styles.formRow}>
            <Input
              label='Place'
              maxLength={FormLimits.place}
              invalid={!inputs.accommodation_place.isValid}
              errors={inputs.accommodation_place.errors}
              textInputConfig={{
                value: inputs.accommodation_place.value,
                onChangeText: inputChangedHandler.bind(
                  this,
                  'accommodation_place'
                ),
              }}
            />
            <LocationPicker
              onPickLocation={handlePickLocation}
              pickedLocation={
                inputs.accommodation_latitude.value &&
                inputs.accommodation_longitude.value
                  ? {
                      lat: inputs.accommodation_latitude.value,
                      lng: inputs.accommodation_longitude.value,
                      title: inputs.accommodation_place.value,
                    }
                  : undefined
              }
              colorScheme={ColorScheme.complementary}
              majorStageId={majorStageId}
              countryId={majorStage?.country.id}
            />
          </View>
          <View style={styles.formRow}>
            <AmountElement
              unconvertedInput={inputs.unconvertedAmount}
              inputChangedHandler={inputChangedHandler}
              maxAmount={maxAvailableMoney}
              field='accommodation_costs'
            />
          </View>
          <View style={styles.formRow}>
            <Input
              label='Link'
              maxLength={100}
              invalid={!inputs.accommodation_link.isValid}
              errors={inputs.accommodation_link.errors}
              textInputConfig={{
                value: inputs.accommodation_link.value,
                onChangeText: inputChangedHandler.bind(
                  this,
                  'accommodation_link'
                ),
              }}
            />

            <View style={styles.checkBoxContainer}>
              <Text style={styles.checkBoxLabel}>Booked?</Text>
              <Checkbox
                status={
                  inputs.accommodation_booked.value ? 'checked' : 'unchecked'
                }
                onPress={() =>
                  inputChangedHandler(
                    'accommodation_booked',
                    !inputs.accommodation_booked.value
                  )
                }
                uncheckedColor={GlobalStyles.colors.grayMedium}
                color={GlobalStyles.colors.purpleAccent}
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
    marginHorizontal: 16,
    marginVertical: 8,
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
  separator: {
    borderTopColor: GlobalStyles.colors.grayMedium,
    borderTopWidth: 2,
    marginTop: 8,
  },
  subtitle: {
    alignSelf: 'center',
    fontSize: 18,
    color: GlobalStyles.colors.grayMedium,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkBoxContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 'auto',
    marginBottom: '5%',
  },
  checkBoxLabel: {
    color: GlobalStyles.colors.grayMedium,
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

export default MinorStageForm;
