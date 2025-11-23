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
import MapView, { MapPressEvent, Region } from 'react-native-maps';

import { Icons, Location, StackParamList } from '../models';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
import MapsMarker from '../components/Maps/MapsMarker';
import HeaderTitle from '../components/UI/HeaderTitle';
import {
  formatPlaceToLocation,
  getRegionForLocations,
} from '../utils/location';
import { CustomCountryContext } from '../store/custom-country-context';
import { generateRandomString } from '../utils';
import IconButton from '../components/UI/IconButton';

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
  const customCountryIds = route.params.customCountryIds;

  const [isFav, setIsFav] = useState(true);
  const [isVisited, setIsVisited] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: location?.data.latitude || 0,
    longitude: location?.data.longitude || 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.04,
  });

  let shownLocations: Location[] = [];
  for (const id of customCountryIds) {
    const placesToVisit = customCountryCtx.findCountriesPlaces(id);
    const newLocations = placesToVisit
      ? placesToVisit.map(formatPlaceToLocation)
      : [];
    shownLocations.push(...newLocations);
  }

  if (!isFav) {
    shownLocations = shownLocations.filter((place) => place.favourite === true);
  }

  if (!isVisited) {
    shownLocations = shownLocations.filter((place) => place.done !== true);
  }

  useEffect(() => {
    async function calculateRegion() {
      if (shownLocations) {
        setRegion(await getRegionForLocations(shownLocations));
      }
    }
    calculateRegion();
  }, [route.params]);

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
      headerRight: () => (
        <>
          <IconButton
            icon={Icons.heartOutline}
            onPress={() => setIsFav((prevValue) => !prevValue)}
            size={26}
            color={!isFav ? 'red' : 'black'}
          />
          <IconButton
            icon={Icons.eyeOn}
            onPress={() => setIsVisited((prevValue) => !prevValue)}
            size={26}
            color={isVisited ? 'blue' : 'black'}
          />
        </>
      ),
      headerStyle: headerstyle,
      headerTintColor: GlobalStyles.colors.grayDark,
    });
  }, [isFav, isVisited]);

  function handlePressMap(event: MapPressEvent) {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;

    if (customCountryIds.length === 1) {
      navigation.navigate('ManagePlaceToVisit', {
        placeId: null,
        countryId: customCountryIds[0],
        lat: lat,
        lng: lng,
      });
    }
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
        {shownLocations &&
          shownLocations.map((loc) => {
            return <MapsMarker location={loc} key={generateRandomString()} />;
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
