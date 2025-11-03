import React, {
  ReactElement,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';

import {
  BottomTabsParamList,
  Icons,
  ManageCustomCountryRouteProp,
  StackParamList,
} from '../models';
import { CustomCountryContext } from '../store/custom-country-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalStyles } from '../constants/styles';
import CustomCountryForm from '../components/Locations/ManageLocation/CustomCountryForm';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import IconButton from '../components/UI/IconButton';
import {
  DeleteCustomCountryProps,
  UpdateCustomCountryProps,
} from '../utils/http/custom_country';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import PlacesList from '../components/Locations/Places/PlacesList';
import MainGradient from '../components/UI/LinearGradients/MainGradient';
import HeaderTitle from '../components/UI/HeaderTitle';
import { generateRandomString } from '../utils';

interface ManageCustomCountryProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ManageCustomCountry'>;
  route: ManageCustomCountryRouteProp;
}

const ManageCustomCountry: React.FC<ManageCustomCountryProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isShowingPlaces, setIsShowingPlaces] = useState(false);

  const customCountryCtx = useContext(CustomCountryContext);
  const countryId = route.params.countryId;

  const country = customCountryCtx.customCountries.find(
    (country) => country.id === countryId
  );
  if (!country && !error) {
    setError('Country not found');
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: GlobalStyles.colors.grayDark,
      headerTitle: () => <HeaderTitle title={'Country Details'} />,
      headerRight: () => (
        <IconButton
          icon={Icons.edit}
          onPress={handleChangeEdit}
          color={
            isEditing
              ? GlobalStyles.colors.amberAccent
              : GlobalStyles.colors.grayDark
          }
        />
      ),
    });
  }, [navigation, isEditing]);

  function handleChangeEdit() {
    setIsEditing((prevValue) => !prevValue);
  }

  function handleUpdateCountry(response: UpdateCustomCountryProps) {
    const { status, error, customCountry } = response;

    if (error) {
      setError(error);
    } else if (status === 200 && customCountry) {
      customCountryCtx.updateCustomCountry(customCountry);
      setIsEditing(false);
    }
  }

  const secondaryNavigation =
    useNavigation<NavigationProp<BottomTabsParamList>>();

  function handleDeleteCountry(response: DeleteCustomCountryProps) {
    const { countryName, status, error } = response;
    if (error) {
      setError(error);
    } else if (status === 200) {
      customCountryCtx.deleteCustomCountry(countryId);
      const popupText = `"${countryName}" successfully deleted!`;
      secondaryNavigation.navigate('Locations', { popupText: popupText });
    }
  }

  function handleTogglePlaces() {
    setIsShowingPlaces((prevState) => !prevState);
  }

  return (
    <>
      <MainGradient />
      {isShowingPlaces && (
        <PlacesList onCancel={handleTogglePlaces} countryId={countryId} />
      )}
      <View style={styles.root}>
        {error && (
          <ErrorOverlay message={error} onPress={() => setError(null)} />
        )}

        {country && (
          <CustomCountryForm
            key={isEditing ? String(countryId) : generateRandomString()}
            country={country}
            isEditing={isEditing}
            onUpdate={handleUpdateCountry}
            onDelete={handleDeleteCountry}
            handleTogglePlaces={handleTogglePlaces}
            isShowingPlaces={isShowingPlaces}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default ManageCustomCountry;
