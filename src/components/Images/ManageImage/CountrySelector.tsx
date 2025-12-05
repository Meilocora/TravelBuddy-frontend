import React, { ReactElement, useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import OutsidePressHandler from 'react-native-outside-press';
import { CustomCountry } from '../../../models';
import { CustomCountryContext } from '../../../store/custom-country-context';
import ListItem from '../../UI/search/ListItem';

interface CountrySelectorProps {
  onChangeCountry: (country: CustomCountry) => void;
  currentCountry: CustomCountry | undefined;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  onChangeCountry,
  currentCountry,
}): ReactElement => {
  const [openSelection, setOpenSelection] = useState(false);
  const [country, setCountry] = useState<CustomCountry>();

  const customCountryCtx = useContext(CustomCountryContext);

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleCloseModal() {
    setOpenSelection(false);
  }

  function handlePressListElement(item: CustomCountry) {
    setCountry(item);
    onChangeCountry(item);
    setOpenSelection(false);
  }

  let countries = customCountryCtx.customCountries;
  if (currentCountry) {
    countries = countries.filter((country) => country.id !== currentCountry.id);
  }

  return (
    <>
      {openSelection && countries.length > 0 && (
        <OutsidePressHandler
          onOutsidePress={handleCloseModal}
          style={styles.selectionContainer}
        >
          <ScrollView style={styles.listContainer} nestedScrollEnabled={true}>
            {countries.length > 0 &&
              countries.map((item) => (
                <ListItem
                  key={item.id}
                  onPress={() => handlePressListElement(item)}
                  textStyles={styles.listItem}
                >
                  {item.name}
                </ListItem>
              ))}
          </ScrollView>
        </OutsidePressHandler>
      )}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleOpenModal}>
            <Text style={[styles.header, openSelection && styles.openHeader]}>
              {country?.name || 'Choose a country'}
            </Text>
          </Pressable>
        </View>
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
  },
  headerContainer: {
    alignItems: 'flex-end',
  },
  header: {
    textAlign: 'center',
    color: GlobalStyles.colors.grayDark,
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 20,
    width: 150,
    fontSize: 16,
  },
  openHeader: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: GlobalStyles.colors.greenSoft,
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  selectionContainer: {
    position: 'absolute',
    backgroundColor: GlobalStyles.colors.greenSoft,
    right: 0,
    top: 30,
    zIndex: 1,
    width: 150,
  },
  listContainer: {
    maxHeight: 320,
    paddingHorizontal: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingBottom: 2,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  listItem: {
    fontSize: 16,
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default CountrySelector;
