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
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

import { StackParamList } from '../models';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
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

  let headerstyle = { backgroundColor: GlobalStyles.colors.greenBg };
  if (route.params?.colorScheme === 'complementary') {
    headerstyle = { backgroundColor: GlobalStyles.colors.purpleBg };
  }
  if (route.params?.colorScheme === 'accent') {
    headerstyle = { backgroundColor: GlobalStyles.colors.amberBg };
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={'Map'} />,
      headerStyle: headerstyle,
      headerTintColor: GlobalStyles.colors.grayDark,
    });
  }, []);

  function handlePressMap(event: MapPressEvent) {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;

    navigation.navigate('ManagePlaceToVisit', {
      placeId: null,
      countryId: customCountryId,
      lat: lat,
      lng: lng,
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={region!}
        region={region}
        onPress={handlePressMap}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        mapType='standard'
        userInterfaceStyle='light'
        customMapStyle={lightMapStyle}
      >
        {customCountryCtx.findCountriesPlaces(customCountryId)!.map((place) => {
          return (
            <MapsMarker
              location={formatPlaceToLocation(place)}
              key={generateRandomString()}
            />
          );
        })}
        {location && (
          <Marker
            title={location.data.name}
            coordinate={{
              latitude: location.data.latitude,
              longitude: location.data.longitude,
            }}
            description={location.description}
          />
        )}
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
