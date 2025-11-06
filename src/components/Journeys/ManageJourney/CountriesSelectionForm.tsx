import { ReactElement, useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../../UI/IconButton';
import { Icons } from '../../../models';
import TagCloud from '../../UI/TagCloud';
import { fetchCustomCountries } from '../../../utils/http/custom_country';
import CountriesSelection from './CountriesSelection';

interface CountriesSelectionFormProps {
  onAddCountry: (countryName: string) => void;
  onDeleteCountry: (countryName: string) => void;
  invalid: boolean;
  defaultCountryNames?: string[];
}

const CountriesSelectionForm: React.FC<CountriesSelectionFormProps> = ({
  onAddCountry,
  onDeleteCountry,
  invalid,
  defaultCountryNames,
}): ReactElement => {
  const [isInvalid, setIsInvalid] = useState<boolean>(invalid);
  const [openSelection, setOpenSelection] = useState(false);
  const [countryNames, setCountryNames] = useState<string[]>([]);

  // Synchronize state with prop changes
  useEffect(() => {
    setIsInvalid(invalid);
    setCountryNames(defaultCountryNames || []);
  }, [invalid]);

  function handleAddCountry(countryName: string) {
    onAddCountry(countryName);
    setCountryNames([...countryNames, countryName]);
  }

  function handleDeleteCountry(countryName: string) {
    onDeleteCountry(countryName);
    setCountryNames(countryNames.filter((name) => name !== countryName));
  }

  function handleCloseModal() {
    setOpenSelection(false);
    Keyboard.dismiss();
  }

  function handlePressAdd() {
    setIsInvalid(false);
    setOpenSelection((prevValue) => !prevValue);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Countries</Text>
      </View>
      {isInvalid && (
        <View>
          <Text style={styles.errorText}>Please select a country</Text>
        </View>
      )}
      <ScrollView
        style={styles.cloudWrapper}
        contentContainerStyle={styles.cloudContainer}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {countryNames.length > 0 &&
          countryNames.map((name) => (
            <TagCloud
              key={name}
              text={name}
              onPress={() => handleDeleteCountry(name)}
            />
          ))}
      </ScrollView>
      <IconButton icon={Icons.add} onPress={handlePressAdd} />
      {openSelection && (
        <CountriesSelection
          chosenCountries={countryNames}
          onAddHandler={handleAddCountry}
          onCloseModal={handleCloseModal}
          onFetchRequest={fetchCustomCountries}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outside: {
    flex: 1,
    height: '100%',
  },
  container: {
    flex: 1,
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    borderTopWidth: 3,
    borderTopColor: GlobalStyles.colors.grayMedium,
    width: '95%',
    paddingVertical: 4,
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    color: GlobalStyles.colors.grayDark,
  },
  cloudContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  cloudWrapper: {
    width: '95%',
    backgroundColor: GlobalStyles.colors.graySoft,
    height: 70,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
});

export default CountriesSelectionForm;
