import React, { ReactElement, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  JourneyFormValues,
  JourneyValues,
  Journey,
  FormLimits,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import { createJourney, updateJourney } from '../../../utils/http';
import { formatAmount, formatDate, parseDate } from '../../../utils';
import Modal from '../../UI/Modal';
import CountriesSelectionForm from './CountriesSelectionForm';
import ExpoDatePicker from '../../UI/form/ExpoDatePicker';

type InputValidationResponse = {
  journey?: Journey;
  journeyFormValues?: JourneyFormValues;
  error?: string;
  status: number;
};

interface JourneyFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: JourneyValues;
  isEditing?: boolean;
  editJourneyId?: number;
}

const JourneyForm: React.FC<JourneyFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editJourneyId,
}): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedCountries, setDeletedCountries] = useState<string[]>([]);
  const [inputs, setInputs] = useState<JourneyFormValues>({
    name: { value: defaultValues?.name || '', isValid: true, errors: [] },
    description: {
      value: defaultValues?.description || '',
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
    countries: {
      value: defaultValues?.countries || '',
      isValid: true,
      errors: [],
    },
  });

  const defaultCountriesNames = defaultValues?.countries.split(', ') || [];
  // State only exists for easier handling of countryNames
  const [currentCountryNames, setCurrentCountryNames] = useState<string[]>(
    defaultCountriesNames
  );

  function inputChangedHandler(inputIdentifier: string, enteredValue: string) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  function handleAddCountry(countryName: string) {
    setCurrentCountryNames([...currentCountryNames, countryName]);

    const updatedCountryNames = [...currentCountryNames, countryName];

    setInputs((prevValues) => {
      return {
        ...prevValues,
        countries: {
          value: updatedCountryNames.join(', '),
          isValid: true,
          errors: [],
        },
      };
    });
  }

  function handleDeleteCountry(countryName: string) {
    setCurrentCountryNames(
      currentCountryNames.filter((name) => name !== countryName)
    );

    const updatedCountryNames = [...currentCountryNames];

    setInputs((prevValues) => {
      return {
        ...prevValues,
        countries: {
          value: currentCountryNames
            .filter((name) => name !== countryName)
            .join(', '),
          isValid: true,
          errors: [],
        },
      };
    });
  }

  async function validateInputs(
    updateConfirmed: boolean = false
  ): Promise<void> {
    setIsSubmitting(true);

    // Set all errors to empty array to prevent stacking of errors
    for (const key in inputs) {
      inputs[key as keyof JourneyFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      const defaultCountryDeleted = defaultCountriesNames.some(
        (country) => !currentCountryNames.includes(country)
      );

      if (!updateConfirmed && defaultCountryDeleted) {
        setDeletedCountries(
          defaultCountriesNames.filter(
            (country) => !currentCountryNames.includes(country)
          )
        );
        return;
      }
      response = await updateJourney(inputs, editJourneyId!);
    } else if (!isEditing) {
      response = await createJourney(inputs);
    }

    const { error, status, journey, journeyFormValues } = response!;

    if (!error && journey) {
      onSubmit({ journey, status });
    } else if (error) {
      onSubmit({ error, status });
    } else if (journeyFormValues) {
      setInputs((prevValues) => journeyFormValues);
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

  function closeModalHandler() {
    setDeletedCountries([]);
  }

  return (
    <>
      {deletedCountries.length > 0 && (
        <Modal
          title='Are you sure?'
          content={`Major Stages and Minor Stages, that are connected to the following countries will be deleted: ${deletedCountries.join(
            ', '
          )}`}
          onConfirm={validateInputs.bind(this, true)}
          onCancel={closeModalHandler}
        />
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='height'
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.formContainer}>
            <View>
              <Input
                label='Name'
                maxLength={FormLimits.journeyName}
                invalid={!inputs.name.isValid}
                errors={inputs.name.errors}
                mandatory
                textInputConfig={{
                  value: inputs.name.value,
                  onChangeText: inputChangedHandler.bind(this, 'name'),
                }}
              />
              <Input
                label='Description'
                maxLength={FormLimits.journeyDescription}
                invalid={!inputs.description.isValid}
                errors={inputs.description.errors}
                textInputConfig={{
                  multiline: true,
                  value: inputs.description.value,
                  onChangeText: inputChangedHandler.bind(this, 'description'),
                }}
              />
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
                    value: inputs.budget.value.toString(),
                    onChangeText: inputChangedHandler.bind(this, 'budget'),
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
                  maximumDate={
                    inputs.scheduled_end_time.value
                      ? parseDate(inputs.scheduled_end_time.value)
                      : undefined
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
                      : undefined
                  }
                />
              </View>
              <CountriesSelectionForm
                onAddCountry={handleAddCountry}
                onDeleteCountry={handleDeleteCountry}
                invalid={!inputs.countries.isValid}
                defaultCountryNames={defaultCountriesNames}
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
                onPress={validateInputs.bind(this, undefined)}
                colorScheme={ColorScheme.neutral}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : submitButtonLabel}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: GlobalStyles.colors.grayMedium,
    backgroundColor: GlobalStyles.colors.greenSoft,
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

export default JourneyForm;
