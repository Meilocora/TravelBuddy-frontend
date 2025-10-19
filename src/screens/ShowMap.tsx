import 'react-native-get-random-values';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import MapView, { Region } from 'react-native-maps';

import { StackParamList } from '../models';
import { GlobalStyles } from '../constants/styles';
import MapsMarker from '../components/Maps/MapsMarker';
import HeaderTitle from '../components/UI/HeaderTitle';
import {
  formatPlaceToLocation,
  getRegionForLocations,
} from '../utils/location';
import { CustomCountryContext } from '../store/custom-country-context';
import { generateRandomString } from '../utils';

interface ShowMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ShowMap'>;
  route: RouteProp<StackParamList, 'ShowMap'>;
}

const ShowMap: React.FC<ShowMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const customCountryCtx = useContext(CustomCountryContext);

  const location = route.params.location;
  const customCountryId = route.params.customCountryId;

  const [region, setRegion] = useState<Region>({
    latitude: location?.data.latitude || 0,
    longitude: location?.data.longitude || 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.04,
  });

  console.log(customCountryId);
  console.log('Hey');
  useEffect(() => {
    console.warn('__DEV__ =', __DEV__, 'customCountryId:', customCountryId);
    console.warn('ShowMap mounted');
  }, [customCountryId]);

  // Update the useEffect
  useEffect(() => {
    async function calculateRegion() {
      if (!location) {
        const placesToVisit =
          customCountryCtx.findCountriesPlaces(customCountryId);
        const locationsToVisit = placesToVisit!.map(formatPlaceToLocation);
        setRegion(await getRegionForLocations(locationsToVisit));
      }
    }
    calculateRegion();
  }, []);

  let headerstyle = { backgroundColor: GlobalStyles.colors.primary500 };
  if (route.params?.colorScheme === 'complementary') {
    headerstyle = { backgroundColor: GlobalStyles.colors.complementary700 };
  }
  if (route.params?.colorScheme === 'accent') {
    headerstyle = { backgroundColor: GlobalStyles.colors.accent700 };
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={'Map'} />,
      headerStyle: headerstyle,
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={region!}
        region={region}
        onPress={() => {}}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
      >
        {customCountryCtx.findCountriesPlaces(customCountryId)!.map((place) => {
          return (
            <MapsMarker
              location={formatPlaceToLocation(place)}
              key={generateRandomString()}
            />
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default ShowMap;
