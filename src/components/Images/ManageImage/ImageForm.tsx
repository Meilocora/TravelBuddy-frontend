import React, { ReactElement, useContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  FormLimits,
  MapLocation,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import { formatDateTime } from '../../../utils';
import { Image, ImageFormValues, ImageValues } from '../../../models/image';
import { addImage, updateImage } from '../../../utils/http/image';
import LocationPicker from '../../UI/form/LocationPicker';
import ExpoDateTimePicker from '../../UI/form/ExpoDateTimePicker';
import CustomImagePicker from '../../UI/form/ImagePicker';
import { UserContext } from '../../../store/user-context';

type InputValidationResponse = {
  image?: Image;
  error?: string;
  status: number;
};

interface ImageFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  submitButtonLabel: string;
  defaultValues?: ImageValues;
  isEditing?: boolean;
  editImageId?: number;
}

const ImageForm: React.FC<ImageFormProps> = ({
  onCancel,
  onSubmit,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editImageId,
}): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userCtx = useContext(UserContext);

  const timestamp = defaultValues?.timestamp
    ? defaultValues.timestamp
    : formatDateTime(new Date());

  const [inputs, setInputs] = useState<ImageFormValues>({
    url: { value: defaultValues?.url || '', isValid: true, errors: [] },
    favorite: {
      value: defaultValues?.favorite || false,
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
    timestamp: {
      value: timestamp,
      isValid: true,
      errors: [],
    },
    minorStageId: {
      value: defaultValues?.minorStageId || undefined,
      isValid: true,
      errors: [],
    },
    placeToVisitId: {
      value: defaultValues?.placeToVisitId || undefined,
      isValid: true,
      errors: [],
    },
    description: {
      value: defaultValues?.description || '',
      isValid: true,
      errors: [],
    },
  });

  function inputChangedHandler(
    inputIdentifier: string,
    enteredValue: string | boolean
  ): void {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  async function validateInputs(): Promise<void> {
    setIsSubmitting(true);
    let response: InputValidationResponse;
    if (isEditing) {
      response = await updateImage(inputs, editImageId!);
    } else if (!isEditing && inputs.url.value) {
      response = await addImage(userCtx.userId!, inputs);
    }

    const { error, status } = response!;

    if (!error) {
      onSubmit({ status });
    } else if (error) {
      onSubmit({ error, status });
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
  }

  function handlePickLocation(location: MapLocation) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
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

  function handlePickImage(url: string, lat?: number, lng?: number) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        url: {
          value: url,
          isValid: true,
          errors: [],
        },
        ...(lat && {
          latitude: {
            value: lat,
            isValid: true,
            errors: [],
          },
          longitude: {
            value: lng,
            isValid: true,
            errors: [],
          },
        }),
      };
    });
  }

  // TODO: Also add Selectors for MinorStage and PlaceToVisit

  return (
    <>
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
              <View style={styles.formRow}>
                <CustomImagePicker
                  defaultValue={inputs.url.value}
                  addImage={handlePickImage}
                  favorite={inputs.favorite.value}
                  setFavorite={() => inputChangedHandler.bind(this, 'favorite')}
                  editing={!!editImageId}
                />
              </View>
              <View style={styles.formRow}>
                <ExpoDateTimePicker
                  handleChange={handleChangeDate}
                  inputIdentifier='timestamp'
                  invalid={!inputs.timestamp.isValid}
                  errors={inputs.timestamp.errors}
                  value={inputs.timestamp.value?.toString()}
                  label='Timestamp'
                />
                <LocationPicker
                  onPickLocation={handlePickLocation}
                  onPressMarker={handlePickLocation}
                  pickedLocation={
                    inputs.latitude.value && inputs.longitude.value
                      ? {
                          lat: inputs.latitude.value,
                          lng: inputs.longitude.value,
                          title: 'Photo Location',
                        }
                      : undefined
                  }
                />
              </View>
              <View style={styles.formRow}>
                <Input
                  label='Description'
                  maxLength={FormLimits.imageDescription}
                  invalid={!inputs.description.isValid}
                  errors={inputs.description.errors}
                  textInputConfig={{
                    multiline: true,
                    value: inputs.description.value,
                    onChangeText: inputChangedHandler.bind(this, 'description'),
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
              <Button
                onPress={validateInputs}
                colorScheme={ColorScheme.neutral}
              >
                {submitButtonLabel}
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
    marginVertical: 60,
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

export default ImageForm;
