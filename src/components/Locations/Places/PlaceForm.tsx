import React, { ReactElement, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import Input from '../../UI/form/Input';
import {
  ButtonMode,
  ColorScheme,
  FormLimits,
  Icons,
  MapLocation,
  PlaceFormValues,
  PlaceToVisit,
  PlaceValues,
} from '../../../models';
import Button from '../../UI/Button';
import { GlobalStyles } from '../../../constants/styles';
import {
  createPlace,
  deletePlace,
  updatePlace,
} from '../../../utils/http/place_to_visit';
import IconButton from '../../UI/IconButton';
import Modal from '../../UI/Modal';
import { CustomCountryContext } from '../../../store/custom-country-context';
import LocationPicker from '../../UI/form/LocationPicker';
import ImageModal from '../../UI/ImageModal';
import CustomCheckBox from '../../UI/form/CustomCheckBox';
import CustomLinkInput from '../../UI/form/CustomLinkInput';

type InputValidationResponse = {
  place?: PlaceToVisit;
  placeFormValues?: PlaceFormValues;
  error?: string;
  status: number;
};

interface PlaceFormProps {
  onCancel: () => void;
  onSubmit: (response: InputValidationResponse) => void;
  onDelete: (response: InputValidationResponse, placeId: number) => void;
  submitButtonLabel: string;
  defaultValues?: PlaceValues;
  isEditing?: boolean;
  editPlaceId?: number;
}

const PlaceForm: React.FC<PlaceFormProps> = ({
  onCancel,
  onSubmit,
  onDelete,
  submitButtonLabel,
  defaultValues,
  isEditing,
  editPlaceId,
}): ReactElement => {
  const countryCtx = useContext(CustomCountryContext);
  const countryname = countryCtx.customCountries.find(
    (country) => country.id === defaultValues?.countryId
  )!.name;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [inputs, setInputs] = useState<PlaceFormValues>({
    countryId: { value: defaultValues!.countryId, isValid: true, errors: [] },
    name: { value: defaultValues?.name || '', isValid: true, errors: [] },
    description: {
      value: defaultValues?.description || '',
      isValid: true,
      errors: [],
    },
    visited: {
      value: defaultValues?.visited || false,
      isValid: true,
      errors: [],
    },
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
    link: {
      value: defaultValues?.link || '',
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

  function handlePickLocation(location: MapLocation) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        ...(location.title && {
          name: {
            value: location.title!,
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
    // Set all errors to empty array to prevent stacking of errors
    setIsSubmitting(true);
    for (const key in inputs) {
      inputs[key as keyof PlaceFormValues].errors = [];
    }

    let response: InputValidationResponse;
    if (isEditing) {
      response = await updatePlace(inputs, editPlaceId!);
    } else if (!isEditing) {
      response = await createPlace(inputs);
    }

    const { error, status, place, placeFormValues } = response!;

    if (!error && place) {
      onSubmit({ place, status });
    } else if (error) {
      onSubmit({ error, status });
    } else if (placeFormValues) {
      setInputs((prevValues) => placeFormValues);
    }
    setIsSubmitting(false);
    return;
  }

  async function deletePlaceHandler() {
    const response = await deletePlace(editPlaceId!);
    onDelete(response, editPlaceId!);
    setIsDeleting(false);
    return;
  }

  function deleteHandler() {
    setIsDeleting(true);
  }

  function closeModalHandler() {
    setIsDeleting(false);
  }

  if (isSubmitting) {
    const submitButtonLabel = 'Submitting...';
  }

  return (
    <>
      <ImageModal
        link={inputs.link.value}
        onClose={() => setShowImage(false)}
        visible={showImage}
      />
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`Do you realy want to  delete ${inputs.name.value}?`}
          onConfirm={deletePlaceHandler}
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
            <Text style={styles.header}>
              {isEditing ? 'Manage' : 'Add'} Place for "{countryname}"
            </Text>
            <View>
              <View style={styles.formRow}>
                <Input
                  label='Name'
                  maxLength={FormLimits.place}
                  invalid={!inputs.name.isValid}
                  errors={inputs.name.errors}
                  mandatory
                  textInputConfig={{
                    value: inputs.name.value,
                    onChangeText: inputChangedHandler.bind(this, 'name'),
                  }}
                />
                <LocationPicker
                  onPickLocation={handlePickLocation}
                  onPressMarker={handlePickLocation}
                  pickedLocation={
                    inputs.latitude.value && inputs.longitude.value
                      ? {
                          lat: inputs.latitude.value,
                          lng: inputs.longitude.value,
                          title: inputs.name.value,
                        }
                      : undefined
                  }
                  iconColor={
                    !inputs.latitude.isValid
                      ? GlobalStyles.colors.error200
                      : undefined
                  }
                  countryId={defaultValues!.countryId}
                />
              </View>
              <View style={styles.formRow}>
                <Input
                  label='Description'
                  maxLength={FormLimits.placeDescription}
                  invalid={!inputs.description.isValid}
                  errors={inputs.description.errors}
                  textInputConfig={{
                    multiline: true,
                    value: inputs.description.value,
                    onChangeText: inputChangedHandler.bind(this, 'description'),
                  }}
                />
              </View>
              <View style={styles.formRow}>
                <CustomLinkInput
                  input={inputs.link}
                  onChangeText={inputChangedHandler.bind(this, 'link')}
                  setShowImage={() => setShowImage(true)}
                />
              </View>
              <View style={styles.formRow}>
                <CustomCheckBox
                  value={inputs.visited.value}
                  mode='visited'
                  onPress={() =>
                    inputChangedHandler('visited', !inputs.visited.value)
                  }
                />
                <CustomCheckBox
                  value={inputs.favorite.value}
                  mode='favorite'
                  onPress={() =>
                    inputChangedHandler('favorite', !inputs.favorite.value)
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
              >
                {submitButtonLabel}
              </Button>
            </View>
          </View>
          <View style={styles.deleteContainer}>
            <IconButton
              icon={Icons.delete}
              onPress={deleteHandler}
              size={62}
              color={GlobalStyles.colors.error500}
            />
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
    marginTop: '15%',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: GlobalStyles.colors.grayMedium,
    backgroundColor: GlobalStyles.colors.graySoft,
    elevation: 10,
    shadowColor: GlobalStyles.colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    color: GlobalStyles.colors.grayDark,
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
  deleteContainer: {
    width: '100%',
    marginHorizontal: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlaceForm;
