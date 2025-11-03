import { ReactElement, useContext, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import SearchElement from '../UI/search/SearchElement';
import { CustomCountry, Icons } from '../../models';
import { CustomCountryContext } from '../../store/custom-country-context';
import { addCountry, fetchCountries } from '../../utils/http/custom_country';
import CountriesList from './CountriesList';
import IconButton from '../UI/IconButton';
import CountrySearch from './CountrySearch';
import { GlobalStyles } from '../../constants/styles';

interface CustomCountriesProps {}

const CustomCountries: React.FC<CustomCountriesProps> = (): ReactElement => {
  const customCountryCtx = useContext(CustomCountryContext);

  const [isAddCountry, setIsAddCountry] = useState(false);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  function onAddCountry(addedItem: CustomCountry): void {
    customCountryCtx.addCustomCountry(addedItem);
    setIsAddCountry(false);
  }

  function handleOutsidePress(): void {
    setIsAddCountry(false);
    setSearch(false);
    Keyboard.dismiss();
  }

  function handleTapSort() {
    if (sort === 'asc') {
      setSort('desc');
    } else {
      setSort('asc');
    }
  }

  function handleTapSearch() {
    setSearch((prevValue) => !prevValue);
  }

  let countries = customCountryCtx.customCountries;

  if (sort === 'desc') {
    countries = [...countries].sort((a, b) => b.name.localeCompare(a.name));
  } else {
    countries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (searchTerm !== '') {
    countries = countries.filter((country) =>
      country.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
  }

  return (
    <View style={styles.container}>
      {isAddCountry && (
        <SearchElement
          onFetchRequest={fetchCountries}
          onAddHandler={onAddCountry}
          onAddRequest={addCountry}
          searchTermLabel='Country Name'
          onOutsidePress={handleOutsidePress}
        />
      )}
      <View style={styles.iconButtonsContainer}>
        <IconButton
          icon={Icons.add}
          onPress={() => setIsAddCountry((prevState) => !prevState)}
        />
        <IconButton
          icon={Icons.search}
          onPress={handleTapSearch}
          color={searchTerm ? GlobalStyles.colors.amberAccent : undefined}
        />
        <IconButton
          icon={Icons.filter}
          onPress={handleTapSort}
          color={sort === 'desc' ? GlobalStyles.colors.amberAccent : undefined}
          style={
            sort === 'desc' ? { transform: [{ rotate: '180deg' }] } : undefined
          }
        />
      </View>
      {search && (
        <CountrySearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSearch={setSearch}
        />
      )}
      <CountriesList countries={countries} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '70%',
    marginHorizontal: 'auto',
    marginTop: 10,
  },
});

export default CustomCountries;
