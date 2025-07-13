import { Text, View, StyleSheet, Pressable, Platform } from 'react-native';

import { CustomCountry, StackParamList } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import { Icons } from '../../models';
import GridInfoLine from './GridInfoLine';
import { formatQuantity } from '../../utils';
import { getLanguageNames } from '../../utils/languages';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface CountryGridTileProps {
  country: CustomCountry;
  index: number;
}

const CountryGridTile: React.FC<CountryGridTileProps> = ({
  country,
  index,
}) => {
  const navigation = useNavigation<NavigationProp<StackParamList>>();

  const languages = getLanguageNames(country.languages, true);
  const population = formatQuantity(country.population ?? 0);

  function onPressHandler(): void {
    navigation.navigate('ManageCustomCountry', {
      countryId: country.id,
    });
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 200).duration(700)}
      exiting={FadeOutDown}
      style={[styles.container, country.visited ? styles.visited : undefined]}
    >
      <Pressable
        android_ripple={{ color: GlobalStyles.colors.accent100 }}
        onPress={onPressHandler}
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.buttonPressed : null,
        ]}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {country.name}
          </Text>
          {country.subregion && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {country.subregion}
            </Text>
          )}
          {country.capital && (
            <GridInfoLine icon={Icons.capital} value={country.capital} />
          )}
          {languages && (
            <GridInfoLine icon={Icons.language} value={languages} />
          )}
          {country.currencies && (
            <GridInfoLine icon={Icons.currency} value={country.currencies} />
          )}
          {population && (
            <GridInfoLine icon={Icons.population} value={population} />
          )}
          <GridInfoLine
            icon={Icons.placesToVisit}
            value={country.placesToVisit?.length.toString() || '0'}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '45%',
    height: 215,
    marginVertical: 10,
    marginHorizontal: 'auto',
    borderWidth: 1,
    borderColor: GlobalStyles.colors.gray100,
    borderRadius: 10,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    backgroundColor: 'transparent',
  },
  visited: {
    borderColor: GlobalStyles.colors.accent500,
  },
  button: {
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  innerContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GlobalStyles.colors.gray100,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontStyle: 'italic',
    color: GlobalStyles.colors.gray200,
    marginBottom: 6,
  },
});

export default CountryGridTile;
