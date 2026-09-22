import { ReactElement, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  calculateDatesForMinorStage,
  calculateMaxDurationDaysForMinorStage,
  createMinorStage,
  formatAmount,
  updateMinorStage,
} from '../../../utils';
import LocationPicker from '../../UI/form/LocationPicker';
import { StagesContext } from '../../../store/stages-context';
import AmountElement from '../../UI/form/Money/AmountElement';
import PositionSelector from '../../UI/form/PositionSelector';
import CustomLinkInput from '../../UI/form/CustomLinkInput';
import CustomCheckBox from '../../UI/form/CustomCheckBox';
import LinkImageModal from '../../UI/LinkImageModal';
import StageDates from '../../UI/form/StageDates';

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

  const [showImage, setShowImage] = useState(false);

  const minorStages = majorStage!.minorStages;

  let maxAvailableMoney = majorStage!.costs.budget;

  minorStages?.forEach((ms) => {
    if (!isEditing || ms.id !== editMinorStageId) {
      maxAvailableMoney -= ms.costs.budget;
    }
  });

  let positions: number[];
  if (defaultValues?.position) {
    positions = Array.from(
      { length: minorStages?.length ?? 0 }, // if no stages -> length = 1
      (_, i) => i + 1,
    );
  } else {
    positions = Array.from(
      { length: (minorStages?.length ?? 0) + 1 }, // if no stages -> length = 1
      (_, i) => i + 1,
    );
  }
  const initialPosition = isEditing
    ? (defaultValues?.position ?? 1)
    : positions[positions.length - 1];

  const maxDurationDays = calculateMaxDurationDaysForMinorStage(majorStage);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [durationError, setDurationError] = useState<boolean>(false);

  const [inputs, setInputs] = useState<MinorStageFormValues>({
    title: { value: defaultValues?.title || '', isValid: true, errors: [] },
    scheduled_start_time: {
      value: null,
      isValid: true,
      errors: [],
    },
    scheduled_end_time: {
      value: null,
      isValid: true,
      errors: [],
    },
    duration_days: {
      value: defaultValues?.duration_days ?? 0,
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
      value: defaultValues?.accommodation_latitude ?? undefined,
      isValid: true,
      errors: [],
    },
    accommodation_longitude: {
      value: defaultValues?.accommodation_longitude ?? undefined,
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

  useEffect(() => {
    setInputs({
      title: { value: defaultValues?.title || '', isValid: true, errors: [] },
      scheduled_start_time: {
        value: null,
        isValid: true,
        errors: [],
      },
      scheduled_end_time: {
        value: null,
        isValid: true,
        errors: [],
      },
      duration_days: {
        value: defaultValues?.duration_days ?? 0,
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
        value: defaultValues?.accommodation_latitude ?? undefined,
        isValid: true,
        errors: [],
      },
      accommodation_longitude: {
        value: defaultValues?.accommodation_longitude ?? undefined,
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
  }, [editMinorStageId]);

  useEffect(() => {
    if (majorStage != undefined) {
      const [startDate, endDate, durationExceeded] =
        calculateDatesForMinorStage(
          majorStage,
          inputs.duration_days.value,
          initialPosition,
          editMinorStageId,
        );
      setStartDate(startDate);
      setEndDate(endDate);
      setDurationError(durationExceeded);
    }
  }, [inputs.position.value, inputs.duration_days.value]);

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
    enteredValue: string | boolean | number,
  ) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  function handlePickLocation(location: MapLocation) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        ...(currInputs.title.value === '' &&
          location.title && {
            title: {
              value: location.title!,
              isValid: true,
              errors: [],
            },
          }),
        accommodation_place: {
          value: location.title!,
          isValid: true,
          errors: [],
        },
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
        editMinorStageId!,
      );
    } else if (!isEditing) {
      response = await createMinorStage(majorStageId, inputs);
    }

    const { error, status, minorStage, minorStageFormValues } = response!;

    if (status.toString()[0] === '2') {
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

  return (
    <>
      <LinkImageModal
        link={inputs.accommodation_link.value}
        onClose={() => setShowImage(false)}
        visible={showImage}
      />
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
            <Input
              label='Duration'
              maxLength={3}
              invalid={!inputs.duration_days.isValid}
              errors={inputs.duration_days.errors}
              textInputConfig={{
                keyboardType: 'decimal-pad',
                value:
                  inputs.duration_days.value > 0
                    ? inputs.duration_days.value.toString()
                    : '',
                placeholder: `Max: ${maxDurationDays}`,
                onChangeText: (text) =>
                  inputChangedHandler(
                    'duration_days',
                    text === '' ? 0 : Number(text),
                  ),
              }}
              mandatory
            />
            <StageDates
              startDate={startDate}
              endDate={endDate}
              durationError={durationError}
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
                  'accommodation_place',
                ),
              }}
            />
            <LocationPicker
              onPickLocation={handlePickLocation}
              onPressMarker={handlePickLocation}
              pickedLocation={
                inputs.accommodation_latitude.value !== undefined &&
                inputs.accommodation_longitude.value !== undefined
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
            <CustomLinkInput
              input={inputs.accommodation_link}
              onChangeText={inputChangedHandler.bind(
                this,
                'accommodation_link',
              )}
              setShowImage={() => setShowImage(true)}
            />
            <CustomCheckBox
              value={inputs.accommodation_booked.value}
              mode='booked'
              onPress={() =>
                inputChangedHandler(
                  'accommodation_booked',
                  !inputs.accommodation_booked.value,
                )
              }
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
            disabled={isSubmitting || durationError}
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
