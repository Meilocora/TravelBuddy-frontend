import {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import CustomCountries from '../../components/Locations/CustomCountries';
import { CustomCountryContext } from '../../store/custom-country-context';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabsParamList, Icons, StackParamList } from '../../models';
import Popup from '../../components/UI/Popup';
import CurrentElementList from '../../components/CurrentElements/CurrentElementList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconButton from '../../components/UI/IconButton';

interface LocationsProps {
  navigation: NativeStackNavigationProp<BottomTabsParamList, 'Locations'>;
  route: RouteProp<BottomTabsParamList, 'Locations'>;
}

const Locations: React.FC<LocationsProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [popupText, setPopupText] = useState<string | null>();
  const customCountryCtx = useContext(CustomCountryContext);

  const showMapNavigation = useNavigation<NavigationProp<StackParamList>>();

  useEffect(() => {
    async function getCustomCountries() {
      customCountryCtx.fetchUsersCustomCountries();
    }

    getCustomCountries();
  }, []);

  useEffect(() => {
    function activatePopup() {
      if (route.params?.popupText) {
        setPopupText(route.params?.popupText);
      }
    }

    activatePopup();
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton icon={Icons.earth} onPress={handlePressEarth} size={32} />
      ),
    });
  }, [navigation]);

  function handleClosePopup() {
    setPopupText(null);
  }

  function handlePressEarth() {
    showMapNavigation.navigate('ShowMap', {
      customCountryIds: customCountryCtx.getCustomCountriesIds() || [],
    });
  }

  return (
    <View style={styles.root}>
      <CurrentElementList />
      {popupText && <Popup content={popupText} onClose={handleClosePopup} />}
      <CustomCountries />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default Locations;
