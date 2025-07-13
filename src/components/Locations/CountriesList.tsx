import { ReactElement } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';

import CountryGridTile from './CountryGridTile';
import InfoText from '../UI/InfoText';
import { CustomCountry } from '../../models';

interface CountriesListProps {
  countries: CustomCountry[];
}

const CountriesList: React.FC<CountriesListProps> = ({
  countries,
}): ReactElement => {
  return (
    <View style={styles.container}>
      {countries.length > 0 && (
        <FlatList
          data={countries}
          renderItem={({ item, index }) => (
            <CountryGridTile country={item} index={index} />
          )}
          key='customCountries'
          numColumns={2}
        />
      )}
      {countries.length === 0 && <InfoText content='No countries found.' />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default CountriesList;
