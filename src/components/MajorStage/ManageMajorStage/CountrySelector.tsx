import React, { ReactElement, useCallback, useContext, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import { ButtonMode, ColorScheme } from '../../../models';
import ListItem from '../../UI/search/ListItem';
import Input from '../../UI/form/Input';
import { generateRandomString } from '../../../utils';
import Button from '../../UI/Button';
import { useFocusEffect } from '@react-navigation/native';
import OutsidePressHandler from 'react-native-outside-press';
import { StagesContext } from '../../../store/stages-context';

interface CountrySelectorProps {
  onChangeCountry: (countryName: string) => void;
  invalid: boolean;
  journeyId: number;
  defaultCountryName: string;
  errors: string[];
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  onChangeCountry,
  invalid,
  journeyId,
  defaultCountryName,
  errors,
}): ReactElement => {
  const [isInvalid, setIsInvalid] = useState<boolean>(invalid);
  const [openSelection, setOpenSelection] = useState(false);
  const [countryName, setCountryName] = useState<string>('');
  const [selectableCountries, setSelectableCountries] = useState<string[]>([]);
  const [chosenCountries, setChosenCountries] = useState<string[]>([]);

  const stagesCtx = useContext(StagesContext);
  const journey = stagesCtx.findJourney(journeyId);

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleCloseModal() {
    setOpenSelection(false);
    Keyboard.dismiss();
  }

  useFocusEffect(
    useCallback(() => {
      // Fetch data when the screen comes into focus
      function assignCountries() {
        const countriesList = Array.from(
          new Set(journey!.majorStages?.map((stage) => stage.country.name))
        );
        setChosenCountries(countriesList || []);

        const journeyCountries = journey!.countries!.map(
          (country) => country.name
        );
        const leftOverCountries = journeyCountries?.filter(
          (country) => !countriesList.includes(country)
        );

        setSelectableCountries(leftOverCountries || []);
      }

      assignCountries();

      return () => {
        // Cleanup function to reset all states when the screen goes out of focus
        setCountryName('');
        setSelectableCountries([]);
        setChosenCountries([]);
        setOpenSelection(false);
        setIsInvalid(false);
      };
    }, [journeyId])
  );

  function handlePressListElement(item: string) {
    const prevCountry = countryName;

    setChosenCountries((prevValues) => {
      const reducedCountries = prevValues.filter(
        (element) => element !== prevCountry
      );
      if (!reducedCountries.includes(item)) {
        return [...reducedCountries, item];
      } else {
        return [...reducedCountries];
      }
    });

    setSelectableCountries((prevValues) => {
      const reducedCountries = prevValues.filter((element) => element !== item);
      if (prevCountry) {
        return [...reducedCountries, prevCountry];
      } else {
        return [...reducedCountries];
      }
    });

    setCountryName(item);
    onChangeCountry(item);
    setOpenSelection(false);
  }

  return (
    <>
      {openSelection && (
        <OutsidePressHandler
          onOutsidePress={handleCloseModal}
          style={styles.selectionContainer}
        >
          <View style={styles.listContainer}>
            <ScrollView style={styles.list} nestedScrollEnabled={true}>
              {selectableCountries.length > 0 &&
                selectableCountries.map((item) => (
                  <ListItem
                    key={generateRandomString()}
                    onPress={handlePressListElement.bind(item)}
                  >
                    {item}
                  </ListItem>
                ))}
              {chosenCountries.length > 0 && (
                <View>
                  <Text style={styles.separatorText}>Journeys countries</Text>
                  {chosenCountries.map((item) => (
                    <ListItem
                      key={generateRandomString()}
                      onPress={() => {}}
                      containerStyles={styles.chosenListElement}
                      textStyles={styles.chosenText}
                    >
                      {item}
                    </ListItem>
                  ))}
                </View>
              )}
            </ScrollView>
            <Button
              colorScheme={ColorScheme.neutral}
              mode={ButtonMode.flat}
              onPress={handleCloseModal}
              style={styles.button}
            >
              Dismiss
            </Button>
          </View>
        </OutsidePressHandler>
      )}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleOpenModal}>
            <Input
              label='Country'
              maxLength={100}
              errors={errors}
              mandatory
              textInputConfig={{
                value: countryName !== '' ? countryName : defaultCountryName,
                readOnly: true,
                placeholder: 'Pick Country',
              }}
            />
          </Pressable>
        </View>
        {isInvalid && (
          <View>
            <Text style={styles.errorText}>Please select a country</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outside: {
    flex: 1,
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    color: GlobalStyles.colors.gray50,
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  selectionContainer: {
    position: 'absolute',
    left: Dimensions.get('window').width / 8,
    bottom: Dimensions.get('window').height / 8,
    maxHeight: 300,
    zIndex: 1,
  },
  listContainer: {
    marginVertical: 'auto',
    marginHorizontal: 'auto',
    paddingTop: 20,
    paddingHorizontal: 15,
    width: 200,
    maxHeight: 300,
    backgroundColor: GlobalStyles.colors.gray700,
    borderRadius: 20,
  },
  list: {
    paddingHorizontal: 10,
    borderColor: GlobalStyles.colors.gray200,
    borderWidth: 0.5,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  separatorText: {
    color: GlobalStyles.colors.gray100,
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  chosenListElement: {
    backgroundColor: GlobalStyles.colors.gray300,
    borderWidth: 0,
  },
  chosenText: {
    color: GlobalStyles.colors.gray700,
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default CountrySelector;
