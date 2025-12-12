import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  FormLimits,
  MapLocation,
} from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../UI/Button';
import { formatDateTime, parseDateAndTime } from '../../../utils';
import { Image, ImageFormValues, ImageValues } from '../../../models/image';
import { addImage, updateImage } from '../../../utils/http/image';
import LocationPicker from '../../UI/form/LocationPicker';
import ExpoDateTimePicker from '../../UI/form/ExpoDateTimePicker';
import CustomImagePicker from '../../UI/form/ImagePicker';
import { UserContext } from '../../../store/user-context';
import MinorStageSelector from './MinorStageSelector';
import PlaceToVisitSelector from './PlaceToVisitSelector';
import { StagesContext } from '../../../store/stages-context';
import { LatLng } from 'react-native-maps';

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
  const [imageCoords, setImageCoords] = useState<LatLng | undefined>(
    defaultValues?.latitude && defaultValues?.longitude
      ? { latitude: defaultValues.latitude, longitude: defaultValues.longitude }
      : undefined
  );

  const userCtx = useContext(UserContext);
  const stagesCtx = useContext(StagesContext);

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

  useEffect(() => {
    if (!inputs.timestamp.value) return;
    const currentMinorStage = stagesCtx.findMinorStageByDate(
      parseDateAndTime(inputs.timestamp.value)
    );
    setInputs((prevValues) => ({
      ...prevValues,
      minorStageId: {
        value: currentMinorStage?.id || undefined,
        isValid: true,
        errors: [],
      },
    }));
  }, [inputs.timestamp.value]);

  function inputChangedHandler(
    inputIdentifier: string,
    enteredValue: string | boolean | number | undefined
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

  function handlePickImage(
    url: string,
    lat?: number,
    lng?: number,
    timestamp?: Date
  ) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        url: {
          value: url,
          isValid: true,
          errors: [],
        },
        ...(lat !== undefined &&
          lng !== undefined && {
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
        ...(timestamp && {
          timestamp: {
            value: formatDateTime(timestamp),
            isValid: true,
            errors: [],
          },
        }),
      };
    });

    if (lat !== undefined && lng !== undefined) {
      setImageCoords({ latitude: lat, longitude: lng });
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps='handled'
      >
        <CustomImagePicker
          defaultValue={inputs.url.value}
          addImage={handlePickImage}
          favorite={inputs.favorite.value}
          setFavorite={() =>
            inputChangedHandler('favorite', !inputs.favorite.value)
          }
          editing={!!editImageId}
        />
        <View style={styles.formContainer}>
          <View>
            <View style={styles.formRow}>
              <MinorStageSelector
                defaultValue={inputs.minorStageId?.value}
                errors={[]}
                invalid={true}
                onChangeMinorStage={(minorStageId) =>
                  inputChangedHandler('minorStageId', minorStageId)
                }
              />
              <PlaceToVisitSelector
                defaultValue={inputs.placeToVisitId?.value}
                errors={[]}
                invalid={true}
                onChangePlace={(placeId) =>
                  inputChangedHandler('placeToVisitId', placeId)
                }
                imageCoords={imageCoords}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : submitButtonLabel}
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBlock: 20,
  },
  formContainer: {
    marginHorizontal: 16,
    paddingHorizontal: 8,
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
