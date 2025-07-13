import { ReactElement, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  MajorStage,
  MapLocation,
  MinorStage,
  Transportation,
  TransportationFormValues,
  TransportationValues,
} from '../../models';
import Input from '../UI/form/Input';
import { parseDate } from '../../utils';
import Button from '../UI/Button';
import { GlobalStyles } from '../../constants/styles';
import DateTimePicker from '../UI/form/DateTimePicker';
import TransportTypeSelector from './TransportTypeSelector';
import {
  createTransportation,
  updateTransportation,
} from '../../utils/http/transportation';
import LocationPicker from '../UI/form/LocationPicker';
import { StagesContext } from '../../store/stages-context';
import AmountElement from '../UI/form/Money/AmountElement';

type InputValidationResponse = {
  transportation?: Transportation;
  backendMajorStageId?: number;
  transportationFormValues?: TransportationFormValues;
  error?: string;
  status: number;
  mode?: 'major' | 'minor';
};

interface TransportationFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: TransportationValues;
  isEditing?: boolean;
  majorStageId: number;
  minorStageId?: number;
}

const TransportationForm: React.FC<TransportationFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  majorStageId,
  minorStageId,
}): ReactElement => {
  let stage: MajorStage | MinorStage;
  let minStartDate: Date;
  let maxStartDate: Date;
  const stagesCtx = useContext(StagesContext);

  if (majorStageId !== undefined) {
    stage = stagesCtx.findMajorStage(majorStageId)!;
  } else {
    stage = stagesCtx.findMinorStage(minorStageId!)!;
  }

  minStartDate = parseDate(stage!.scheduled_start_time);
  minStartDate.setDate(minStartDate.getDate() - 1);
  maxStartDate = parseDate(stage!.scheduled_start_time);
  maxStartDate.setDate(maxStartDate.getDate() + 1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const [inputs, setInputs] = useState<TransportationFormValues>({
    type: {
      value: defaultValues?.type || '',
      isValid: true,
      errors: [],
    },
    start_time: {
      value: defaultValues?.start_time || null,
      isValid: true,
      errors: [],
    },
    arrival_time: {
      value: defaultValues?.arrival_time || null,
      isValid: true,
      errors: [],
    },
    place_of_departure: {
      value: defaultValues?.place_of_departure || '',
      isValid: true,
      errors: [],
    },
    departure_latitude: {
      value: defaultValues?.departure_latitude || undefined,
      isValid: true,
      errors: [],
    },
    departure_longitude: {
      value: defaultValues?.departure_longitude || undefined,
      isValid: true,
      errors: [],
    },
    place_of_arrival: {
      value: defaultValues?.place_of_arrival || '',
      isValid: true,
      errors: [],
    },
    arrival_latitude: {
      value: defaultValues?.arrival_latitude || undefined,
      isValid: true,
      errors: [],
    },
    arrival_longitude: {
      value: defaultValues?.arrival_longitude || undefined,
      isValid: true,
      errors: [],
    },
    transportation_costs: {
      value: 0,
      isValid: true,
      errors: [],
    },
    unconvertedAmount: {
      value: defaultValues?.transportation_costs.toString() || '',
      isValid: true,
      errors: [],
    },
    link: {
      value: defaultValues?.link || '',
      isValid: true,
      errors: [],
    },
  });

  // Redefine inputs, when defaultValues change
  useEffect(() => {
    setInputs({
      type: {
        value: defaultValues?.type || '',
        isValid: true,
        errors: [],
      },
      start_time: {
        value: defaultValues?.start_time || null,
        isValid: true,
        errors: [],
      },
      arrival_time: {
        value: defaultValues?.arrival_time || null,
        isValid: true,
        errors: [],
      },
      place_of_departure: {
        value: defaultValues?.place_of_departure || '',
        isValid: true,
        errors: [],
      },
      departure_latitude: {
        value: defaultValues?.departure_latitude || undefined,
        isValid: true,
        errors: [],
      },
      departure_longitude: {
        value: defaultValues?.departure_longitude || undefined,
        isValid: true,
        errors: [],
      },
      place_of_arrival: {
        value: defaultValues?.place_of_arrival || '',
        isValid: true,
        errors: [],
      },
      arrival_latitude: {
        value: defaultValues?.arrival_latitude || undefined,
        isValid: true,
        errors: [],
      },
      arrival_longitude: {
        value: defaultValues?.arrival_longitude || undefined,
        isValid: true,
        errors: [],
      },
      transportation_costs: {
        value: 0,
        isValid: true,
        errors: [],
      },
      unconvertedAmount: {
        value: defaultValues?.transportation_costs.toString() || '',
        isValid: true,
        errors: [],
      },
      link: {
        value: defaultValues?.link || '',
        isValid: true,
        errors: [],
      },
    });
  }, [defaultValues]);

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

  function handleDeparturePickLocation(location: MapLocation) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        ...(location.title && {
          place_of_departure: {
            value: location.title,
            isValid: true,
            errors: [],
          },
        }),
        departure_latitude: {
          value: location.lat,
          isValid: true,
          errors: [],
        },
        departure_longitude: {
          value: location.lng,
          isValid: true,
          errors: [],
        },
      };
    });
  }

  function handleArrivalPickLocation(location: MapLocation) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        ...(location.title && {
          place_of_arrival: {
            value: location.title,
            isValid: true,
            errors: [],
          },
        }),
        arrival_latitude: {
          value: location.lat,
          isValid: true,
          errors: [],
        },
        arrival_longitude: {
          value: location.lng,
          isValid: true,
          errors: [],
        },
      };
    });
  }

  function resetValues() {
    setInputs({
      type: {
        value: '',
        isValid: true,
        errors: [],
      },
      start_time: {
        value: null,
        isValid: true,
        errors: [],
      },
      arrival_time: {
        value: null,
        isValid: true,
        errors: [],
      },
      place_of_departure: {
        value: '',
        isValid: true,
        errors: [],
      },
      departure_latitude: {
        value: undefined,
        isValid: true,
        errors: [],
      },
      departure_longitude: {
        value: undefined,
        isValid: true,
        errors: [],
      },
      place_of_arrival: {
        value: '',
        isValid: true,
        errors: [],
      },
      arrival_latitude: {
        value: undefined,
        isValid: true,
        errors: [],
      },
      arrival_longitude: {
        value: undefined,
        isValid: true,
        errors: [],
      },
      transportation_costs: {
        value: 0,
        isValid: true,
        errors: [],
      },
      unconvertedAmount: {
        value: '',
        isValid: true,
        errors: [],
      },
      link: {
        value: '',
        isValid: true,
        errors: [],
      },
    });
  }

  async function validateInputs(): Promise<void> {
    setIsSubmitting(true);

    // Set all errors to empty array to prevent stacking of errors
    for (const key in inputs) {
      inputs[key as keyof TransportationFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      response = await updateTransportation(
        inputs,
        stage!.transportation!.id,
        majorStageId,
        minorStageId
      );
    } else if (!isEditing) {
      response = await createTransportation(inputs, majorStageId, minorStageId);
    }

    const {
      error,
      status,
      transportation,
      backendMajorStageId,
      transportationFormValues,
    } = response!;

    if (!error && transportation) {
      resetValues();
      onSubmit({
        transportation,
        status,
        backendMajorStageId,
        mode: minorStageId ? 'minor' : 'major',
      });
    } else if (error) {
      onSubmit({
        error,
        status,
        mode: minorStageId ? 'minor' : 'major',
      });
    } else if (transportationFormValues) {
      setInputs((prevValues) => ({
        ...transportationFormValues,
        unconvertedAmount: {
          ...transportationFormValues.unconvertedAmount,
          errors: transportationFormValues.transportation_costs.errors,
          isValid: transportationFormValues.transportation_costs.isValid,
        },
      }));
    }
    setIsSubmitting(false);
    return;
  }

  if (isSubmitting) {
    const submitButtonLabel = 'Submitting...';
  }

  function handleChangeDate(inputIdentifier: string, selectedDate: string) {
    setInputs((prevValues) => ({
      ...prevValues,
      [inputIdentifier]: {
        value: selectedDate,
        isValid: true,
        errors: [],
      },
    }));
    setOpenStartDatePicker(false);
    setOpenEndDatePicker(false);
  }

  return (
    <View style={styles.formContainer}>
      {'country' in stage ? (
        <Text style={styles.header}>
          Destination: "{stage!.country.name || ''}"
        </Text>
      ) : (
        <Text style={styles.header}>Origin: "{stage!.title}"</Text>
      )}
      <View>
        <View style={styles.formRow}>
          <TransportTypeSelector
            onChangeTransportType={inputChangedHandler.bind(this, 'type')}
            defaultType={inputs.type.value}
            invalid={!inputs.type.isValid}
            errors={inputs.type.errors}
          />
        </View>
        <View style={styles.formRow}>
          <AmountElement
            unconvertedInput={inputs.unconvertedAmount}
            inputChangedHandler={inputChangedHandler}
            field='transportation_costs'
          />
        </View>
        <View style={styles.formRow}>
          <Input
            label='Place of departure'
            maxLength={20}
            invalid={!inputs.place_of_departure.isValid}
            errors={inputs.place_of_departure.errors}
            mandatory
            textInputConfig={{
              value: inputs.place_of_departure.value,
              onChangeText: inputChangedHandler.bind(
                this,
                'place_of_departure'
              ),
            }}
          />
          <LocationPicker
            onPickLocation={handleDeparturePickLocation}
            pickedLocation={
              inputs.departure_latitude.value &&
              inputs.departure_longitude.value
                ? {
                    lat: inputs.departure_latitude.value,
                    lng: inputs.departure_longitude.value,
                    title: inputs.place_of_departure.value,
                  }
                : undefined
            }
            colorScheme={
              majorStageId ? ColorScheme.accent : ColorScheme.complementary
            }
            iconColor={!inputs.departure_latitude.isValid ? 'red' : undefined}
          />
        </View>
        <View style={styles.formRow}>
          <Input
            label='Place of arrival'
            maxLength={20}
            invalid={!inputs.place_of_arrival.isValid}
            errors={inputs.place_of_arrival.errors}
            mandatory
            textInputConfig={{
              value: inputs.place_of_arrival.value,
              onChangeText: inputChangedHandler.bind(this, 'place_of_arrival'),
            }}
          />
          <LocationPicker
            onPickLocation={handleArrivalPickLocation}
            pickedLocation={
              inputs.arrival_latitude.value && inputs.arrival_longitude.value
                ? {
                    lat: inputs.arrival_latitude.value,
                    lng: inputs.arrival_longitude.value,
                    title: inputs.place_of_arrival.value,
                  }
                : undefined
            }
            colorScheme={
              majorStageId ? ColorScheme.accent : ColorScheme.complementary
            }
            iconColor={!inputs.arrival_latitude.isValid ? 'red' : undefined}
          />
        </View>
        <View style={styles.formRow}>
          <DateTimePicker
            openDatePicker={openStartDatePicker}
            setOpenDatePicker={() =>
              setOpenStartDatePicker((prevValue) => !prevValue)
            }
            handleChange={handleChangeDate}
            inputIdentifier='start_time'
            invalid={!inputs.start_time.isValid}
            errors={inputs.start_time.errors}
            value={inputs.start_time.value?.toString()}
            label='Departure'
            minimumDate={minStartDate}
            maximumDate={maxStartDate}
          />
          <DateTimePicker
            openDatePicker={openEndDatePicker}
            setOpenDatePicker={() => setOpenEndDatePicker(true)}
            handleChange={handleChangeDate}
            inputIdentifier='arrival_time'
            invalid={!inputs.arrival_time.isValid}
            errors={inputs.arrival_time.errors}
            value={inputs.arrival_time.value?.toString()}
            label='Arrival'
            minimumDate={minStartDate}
            maximumDate={maxStartDate}
          />
        </View>
        <View style={styles.formRow}></View>
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
  );
};

const styles = StyleSheet.create({
  formContainer: {
    opacity: 0.75,
    marginHorizontal: 14,
    marginVertical: 8,
    paddingHorizontal: 4,
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
  header: {
    fontSize: 22,
    textAlign: 'center',
    color: GlobalStyles.colors.gray50,
    fontWeight: 'bold',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
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

export default TransportationForm;
