import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReactElement } from 'react';

import { CustomCountry, StackParamList } from '../../models';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface CountryElementProps {
  country: CustomCountry;
  currentCountry?: boolean;
  isLast?: boolean;
}

const CountryElement: React.FC<CountryElementProps> = ({
  country,
  currentCountry = false,
  isLast = false,
}): ReactElement => {
  const navigation = useNavigation<NavigationProp<StackParamList>>();

  function handlePress() {
    navigation.navigate('ManageCustomCountry', {
      countryId: country.id,
    });
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <Text style={[styles.text, currentCountry && styles.currentText]}>
        {country.name}
        {!isLast && ', '}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 2,
  },
  text: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  currentText: {
    fontWeight: 'bold',
    fontStyle: 'normal',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.5,
  },
});

export default CountryElement;
