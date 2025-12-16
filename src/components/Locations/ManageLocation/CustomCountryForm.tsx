import React, { ReactElement, useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

import {
  ColorScheme,
  CustomCountry,
  CustomCountryFormValues,
  FormLimits,
  Icons,
} from '../../../models';
import Input from '../../UI/form/Input';
import { getLanguageNames } from '../../../utils/languages';
import { formatQuantity } from '../../../utils';
import { GlobalStyles } from '../../../constants/styles';
import TextLink from '../../UI/TextLink';
import Button from '../../UI/Button';
import IconButton from '../../UI/IconButton';
import InfoPoint from './InfoPoint';
import {
  deleteCountry,
  DeleteCustomCountryProps,
  updateCountry,
  UpdateCustomCountryProps,
} from '../../../utils/http/custom_country';
import Modal from '../../UI/Modal';
import PlacesToggle from '../Places/PlacesToggle';
import { UserContext } from '../../../store/user-context';
import { MediumContext } from '../../../store/medium-context';
import { PlaceContext } from '../../../store/place-context';
import LocalMediaList from '../../Images/LocalMediaList';
import LanguagesSelector from './LanguagesSelector';
import CurrenciesSelector from './CurrenciesSelector';

interface CustomCountryFormProps {
  country: CustomCountry;
  isEditing: boolean;
  onUpdate: (response: UpdateCustomCountryProps) => void;
  onDelete: (response: DeleteCustomCountryProps) => void;
  isShowingPlaces: boolean;
  handleTogglePlaces: () => void;
}

const CustomCountryForm: React.FC<CustomCountryFormProps> = ({
  country,
  isEditing,
  onUpdate,
  onDelete,
  isShowingPlaces,
  handleTogglePlaces,
}): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [switchConversion, setSwitchConversion] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  const userCtx = useContext(UserContext);
  const mediumCtx = useContext(MediumContext);
  const placeCtx = useContext(PlaceContext);
  const places = placeCtx.getPlacesByCountry(country.id);
  const placeIds = places.map((p) => p.id);

  const hasMedia = mediumCtx.hasMedia('CustomCountry', country.id, placeIds);

  const languages = getLanguageNames(country.languages);
  const population = formatQuantity(country.population);
  let currency = country.currencies;
  let displayedCurrency = currency && currency[0];

  const currencyObj = userCtx.currencies?.find((c) =>
    Array.isArray(country.currencies)
      ? country.currencies.includes(c.code)
      : c.code === country.currencies
  );

  if (displayedCurrency !== '' && currencyObj && currencyObj.code !== 'EUR') {
    displayedCurrency = `${currencyObj.name} (${currencyObj.code}) \n1${
      currencyObj.symbol
    } ~ ${(1 / currencyObj.conversionRate).toFixed(2)}€`;

    if (switchConversion) {
      displayedCurrency = `${currencyObj.name} (${
        currencyObj.code
      }) \n1€ ~ ${currencyObj.conversionRate.toFixed(2)} ${currencyObj.symbol}`;
    }
  } else if (currencyObj && currencyObj.code === 'EUR') {
    displayedCurrency = `${currencyObj.name} (${currencyObj.code}, ${currencyObj.symbol})`;
  }

  const [inputs, setInputs] = useState<CustomCountryFormValues>({
    currencies: {
      value: country?.currencies || undefined,
      isValid: true,
      errors: [],
    },
    languages: {
      value: country?.languages || undefined,
      isValid: true,
      errors: [],
    },
    capital: {
      value: country?.capital || undefined,
      isValid: true,
      errors: [],
    },
    population: {
      value: country?.population || undefined,
      isValid: true,
      errors: [],
    },
    region: {
      value: country?.region || undefined,
      isValid: true,
      errors: [],
    },
    subregion: {
      value: country?.subregion || undefined,
      isValid: true,
      errors: [],
    },
    visum_regulations: {
      value: country?.visum_regulations || undefined,
      isValid: true,
      errors: [],
    },
    best_time_to_visit: {
      value: country?.best_time_to_visit || undefined,
      isValid: true,
      errors: [],
    },
    general_information: {
      value: country?.general_information || undefined,
      isValid: true,
      errors: [],
    },
  });

  let headerStyle = styles.header;
  if (country.wiki_link) {
    headerStyle = { ...headerStyle, ...styles.underlined };
  }

  function inputChangedHandler(
    inputIdentifier: string,
    enteredValue: string | string[] | undefined
  ) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  function handleChangeLanguages(languages: string[] | undefined) {
    setInputs((currInputs) => {
      return {
        ...currInputs,
        languages: { value: languages || undefined, isValid: true, errors: [] },
      };
    });
  }

  async function validateInputs(): Promise<void> {
    // Set all errors to empty array to prevent stacking of errors
    setIsSubmitting(true);
    for (const key in inputs) {
      inputs[key as keyof CustomCountryFormValues].errors = [];
    }

    const response = await updateCountry(inputs, country.id);

    const { error, status, customCountry, customCountryFormValues } = response!;

    if ((!error && customCountry) || error) {
      onUpdate(response);
    } else if (customCountryFormValues) {
      setInputs((prevValues) => customCountryFormValues);
    }
    setIsSubmitting(false);
    return;
  }

  async function deleteCustomCountryHandler() {
    const response = await deleteCountry(country.id);
    onDelete(response);
    setIsDeleting(false);
    return;
  }

  function deleteHandler() {
    setIsDeleting(true);
  }

  function closeModalHandler() {
    setIsDeleting(false);
  }

  let buttonLabel = 'Submitt';
  if (isSubmitting) {
    buttonLabel = 'Submitting...';
  }

  return (
    <>
      <LocalMediaList
        visible={showMedia}
        handleClose={() => setShowMedia(false)}
        countryId={country.id}
      />
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`If you delete ${country.name}, all related Places to visit will also be deleted permanently`}
          onConfirm={deleteCustomCountryHandler}
          onCancel={closeModalHandler}
        />
      )}
      <View style={styles.container}>
        {!country.wiki_link ? (
          <Text style={styles.header}>{country.name}</Text>
        ) : (
          country.wiki_link && (
            <TextLink link={country.wiki_link} textStyle={headerStyle}>
              {country.name}
            </TextLink>
          )
        )}
        {hasMedia && (
          <IconButton
            icon={Icons.images}
            onPress={() => setShowMedia(true)}
            style={styles.imagesButton}
          />
        )}
        <ScrollView>
          <View style={styles.formRow}>
            {!isEditing ? (
              <>
                <InfoPoint
                  title='Capital'
                  value={country.capital || 'No data...'}
                />
                <InfoPoint
                  title='Population'
                  value={population?.toString() || 'No data...'}
                />
              </>
            ) : (
              <>
                <Input
                  label='Capital'
                  maxLength={FormLimits.countryCapital}
                  invalid={!inputs.capital.isValid}
                  errors={inputs.capital.errors}
                  isEditing={isEditing}
                  style={styles.input}
                  textInputConfig={{
                    value: inputs.capital.value?.toString(),
                    onChangeText: inputChangedHandler.bind(this, 'capital'),
                  }}
                />
                <Input
                  label='Population'
                  maxLength={FormLimits.countryLanguages}
                  invalid={!inputs.population.isValid}
                  errors={inputs.population.errors}
                  isEditing={isEditing}
                  style={styles.input}
                  textInputConfig={{
                    keyboardType: 'decimal-pad',
                    value: inputs.population.value?.toString(),
                    onChangeText: inputChangedHandler.bind(this, 'population'),
                  }}
                />
              </>
            )}
          </View>
          <View style={styles.formRow}>
            {!isEditing ? (
              <Pressable
                style={{ width: '100%' }}
                onPress={() => setSwitchConversion((prevValue) => !prevValue)}
              >
                <InfoPoint
                  title='Currencies'
                  value={displayedCurrency || 'No data...'}
                  touchable={currencyObj && currencyObj.code !== 'EUR'}
                />
              </Pressable>
            ) : (
              <CurrenciesSelector
                currencyCode={inputs.currencies.value}
                onChangeCurrencies={(currencyCode) =>
                  inputChangedHandler('currencies', currencyCode)
                }
              />
            )}
          </View>
          <View style={styles.formRow}>
            {!isEditing ? (
              <>
                <InfoPoint
                  title='Region'
                  value={country.region || 'No data...'}
                />
                <InfoPoint
                  title='Subregion'
                  value={country.subregion || 'No data...'}
                />
              </>
            ) : (
              <>
                <Input
                  label='Region'
                  maxLength={FormLimits.countryRegion}
                  invalid={!inputs.region.isValid}
                  errors={inputs.region.errors}
                  isEditing={isEditing}
                  style={styles.input}
                  textInputConfig={{
                    value: inputs.region.value?.toString(),
                    onChangeText: inputChangedHandler.bind(this, 'region'),
                  }}
                />
                <Input
                  label='Subregion'
                  maxLength={FormLimits.countrySubRegion}
                  invalid={!inputs.subregion.isValid}
                  errors={inputs.subregion.errors}
                  isEditing={isEditing}
                  style={styles.input}
                  textInputConfig={{
                    value: inputs.subregion.value?.toString(),
                    onChangeText: inputChangedHandler.bind(this, 'subregion'),
                  }}
                />
              </>
            )}
          </View>
          <View style={styles.formRow}>
            {!isEditing ? (
              <InfoPoint
                title='Languages'
                value={languages?.toString() || 'No data...'}
              />
            ) : (
              <LanguagesSelector
                onChangeLanguages={handleChangeLanguages}
                languageCodes={inputs.languages.value}
              />
            )}
          </View>
          <View style={styles.formRow}>
            {!isEditing ? (
              <InfoPoint
                title='Best Time to Visit'
                value={country.best_time_to_visit || 'No data...'}
              />
            ) : (
              <Input
                label='Best Time to Visit'
                maxLength={FormLimits.countryBestTimeToVisit}
                invalid={!inputs.best_time_to_visit.isValid}
                errors={inputs.best_time_to_visit.errors}
                isEditing={isEditing}
                style={styles.input}
                textInputConfig={{
                  value: inputs.best_time_to_visit.value?.toString(),
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'best_time_to_visit'
                  ),
                }}
              />
            )}
          </View>
          <View style={styles.formRow}>
            {!isEditing ? (
              <InfoPoint
                title='General Information'
                value={country.general_information || 'No data...'}
              />
            ) : (
              <Input
                label='General Information'
                maxLength={FormLimits.countryGeneralInformation}
                invalid={!inputs.general_information.isValid}
                errors={inputs.general_information.errors}
                isEditing={isEditing}
                style={styles.input}
                textInputConfig={{
                  multiline: true,
                  value: inputs.general_information.value?.toString(),
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'general_information'
                  ),
                }}
              />
            )}
          </View>
          <View style={styles.formRow}>
            {!isEditing ? (
              <InfoPoint
                title='Visum Regulations'
                value={country.visum_regulations || 'No data...'}
              />
            ) : (
              <Input
                label='Visum Regulations'
                maxLength={FormLimits.countryVisumRegulations}
                invalid={!inputs.visum_regulations.isValid}
                errors={inputs.visum_regulations.errors}
                isEditing={isEditing}
                style={styles.input}
                textInputConfig={{
                  multiline: true,
                  value: inputs.visum_regulations.value?.toString(),
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'visum_regulations'
                  ),
                }}
              />
            )}
          </View>
          {!isEditing && (
            <PlacesToggle
              isShowingPlaces={isShowingPlaces}
              handleTogglePlaces={handleTogglePlaces}
            />
          )}
          <View style={styles.buttonsContainer}>
            {!isEditing && (
              <IconButton
                icon={Icons.delete}
                onPress={deleteHandler}
                size={FormLimits.deleteSize}
                color={GlobalStyles.colors.error500}
              />
            )}
            {isEditing && (
              <>
                <Button
                  colorScheme={ColorScheme.primary}
                  onPress={validateInputs}
                  disabled={isSubmitting}
                  style={styles.button}
                >
                  {buttonLabel}
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {},
  container: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 20,
    marginHorizontal: 10,
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    color: GlobalStyles.colors.grayDark,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imagesButton: {
    position: 'absolute',
    right: 0,
  },
  underlined: {
    textDecorationLine: 'underline',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '50%',
    marginVertical: 4,
    marginHorizontal: 'auto',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  input: {
    marginVertical: 4,
  },
  button: {
    marginBottom: 12,
  },
});

export default CustomCountryForm;
