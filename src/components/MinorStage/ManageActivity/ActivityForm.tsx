import { ReactElement, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

import {
  Activity,
  ActivityFormValues,
  ButtonMode,
  ColorScheme,
  FormLimits,
  MapLocation,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import { createActivity, updateActivity } from '../../../utils/http';
import LocationPicker from '../../UI/form/LocationPicker';
import { StagesContext } from '../../../store/stages-context';
import AmountElement from '../../UI/form/Money/AmountElement';

type InputValidationResponse = {
  activity?: Activity;
  activityFormValues?: ActivityFormValues;
  backendJourneyId?: number;
  error?: string;
  status: number;
};

interface ActivityFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: Activity;
  isEditing?: boolean;
  editActivityId?: number;
  minorStageId: number;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editActivityId,
  minorStageId,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);
  const minorStage = stagesCtx.findMinorStage(minorStageId);

  const maxAvailableMoney = Math.max(
    Math.round(
      (minorStage!.costs.budget - minorStage!.costs.spent_money) * 100
    ) / 100,
    0
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputs, setInputs] = useState<ActivityFormValues>({
    name: { value: defaultValues?.name || '', isValid: true, errors: [] },
    description: {
      value: defaultValues?.description || '',
      isValid: true,
      errors: [],
    },
    costs: {
      value: 0,
      isValid: true,
      errors: [],
    },
    unconvertedAmount: {
      value: defaultValues?.costs.toString() || '',
      isValid: true,
      errors: [],
    },
    booked: {
      value: defaultValues?.booked || false,
      isValid: true,
      errors: [],
    },
    place: {
      value: defaultValues?.place || '',
      isValid: true,
      errors: [],
    },
    latitude: {
      value: defaultValues?.latitude || undefined,
      isValid: true,
      errors: [],
    },
    longitude: {
      value: defaultValues?.longitude || undefined,
      isValid: true,
      errors: [],
    },
    link: {
      value: defaultValues?.link || '',
      isValid: true,
      errors: [],
    },
  });

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
    setInputs((currInputs) => {
      return {
        ...currInputs,
        ...(location.title && {
          place: {
            value: location.title,
            isValid: true,
            errors: [],
          },
        }),
        latitude: {
          value: location.lat,
          isValid: true,
          errors: [],
        },
        longitude: {
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
      inputs[key as keyof ActivityFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      response = await updateActivity(inputs, editActivityId!, minorStageId);
    } else if (!isEditing) {
      response = await createActivity(inputs, minorStageId);
    }

    const { error, status, activity, activityFormValues, backendJourneyId } =
      response!;

    if (!error && activity) {
      onSubmit({ activity, status, backendJourneyId });
    } else if (error) {
      onSubmit({ error, status });
    } else if (activityFormValues) {
      setInputs((prevValues) => ({
        ...activityFormValues,
        unconvertedAmount: {
          ...activityFormValues.unconvertedAmount,
          errors: activityFormValues.costs.errors,
          isValid: activityFormValues.costs.isValid,
        },
      }));
    }
    setIsSubmitting(false);
    return;
  }

  if (isSubmitting) {
    const submitButtonLabel = 'Submitting...';
  }

  return (
    <>
      <View style={styles.formContainer}>
        <View>
          <View style={styles.formRow}>
            <Input
              label='Name'
              maxLength={FormLimits.activityName}
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
              label='Description'
              maxLength={FormLimits.activitiesDescription}
              invalid={!inputs.description.isValid}
              errors={inputs.description.errors}
              textInputConfig={{
                value: inputs.description.value,
                multiline: true,
                onChangeText: inputChangedHandler.bind(this, 'description'),
              }}
            />
          </View>
          <View style={styles.formRow}>
            <Input
              label='Place'
              maxLength={FormLimits.place}
              invalid={!inputs.place.isValid}
              errors={inputs.place.errors}
              textInputConfig={{
                value: inputs.place.value,
                onChangeText: inputChangedHandler.bind(this, 'place'),
              }}
            />
            <LocationPicker
              onPickLocation={handlePickLocation}
              pickedLocation={
                inputs.latitude.value && inputs.longitude.value
                  ? {
                      lat: inputs.latitude.value,
                      lng: inputs.longitude.value,
                      title: inputs.place.value,
                    }
                  : undefined
              }
              colorScheme={ColorScheme.complementary}
              majorStageId={
                stagesCtx.findMinorStagesMajorStage(minorStageId)!.id
              }
            />
          </View>
          <View style={styles.formRow}>
            <AmountElement
              unconvertedInput={inputs.unconvertedAmount}
              inputChangedHandler={inputChangedHandler}
              maxAmount={maxAvailableMoney}
              field='costs'
            />
          </View>
          <View style={styles.formRow}>
            <Input
              label='Link'
              maxLength={100}
              invalid={!inputs.link.isValid}
              errors={inputs.link.errors}
              textInputConfig={{
                value: inputs.link.value,
                onChangeText: inputChangedHandler.bind(this, 'link'),
              }}
            />
            <View style={styles.checkBoxContainer}>
              <Text style={styles.checkBoxLabel}>Booked?</Text>
              <Checkbox
                status={inputs.booked.value ? 'checked' : 'unchecked'}
                onPress={() =>
                  inputChangedHandler('booked', !inputs.booked.value)
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
  checkBoxContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 'auto',
    marginBottom: '5%',
  },
  checkBoxLabel: {
    color: GlobalStyles.colors.grayMedium,
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

export default ActivityForm;
