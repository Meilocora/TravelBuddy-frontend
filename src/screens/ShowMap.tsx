import 'react-native-get-random-values';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';

import { Icons, Location, MapType, StackParamList } from '../models';
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
import MapLocationElement from '../components/Maps/MapLocationElement/MapLocationElement';
import { usePersistedState } from '../hooks/usePersistedState';

interface ShowMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ShowMap'>;
  route: RouteProp<StackParamList, 'ShowMap'>;
}

const DELTA = 0.005;

const EDGE_PADDING = { top: 60, right: 60, bottom: 60, left: 60 };

const ShowMap: React.FC<ShowMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const customCountryCtx = useContext(CustomCountryContext);

  const mapRef = useRef<MapView>(null);

  const location = route.params.location;
  const customCountryIds = route.params.customCountryIds;

  const { width, height } = Dimensions.get('window');

  const [isFav, setIsFav] = useState(true);
  const [isVisited, setIsVisited] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: location?.data.latitude || 0,
    longitude: location?.data.longitude || 0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  });
  const [pressedLocation, setPressedLocation] = useState<
    Location | undefined
  >();
  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );

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
      if (shownLocations && !location) {
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
            icon={!isFav ? Icons.heartFilled : Icons.heartOutline}
            onPress={() => setIsFav((prevValue) => !prevValue)}
            size={26}
            color={GlobalStyles.colors.favorite}
          />
          <IconButton
            icon={isVisited ? Icons.eye : Icons.eyeOn}
            onPress={() => setIsVisited((prevValue) => !prevValue)}
            size={26}
            color={GlobalStyles.colors.visited}
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

  // ---------- „Nah heranzoomen“: 1 Punkt = enge Region, >1 Punkt = Bounding-Box ----------
  const fitToItems = useCallback((pts: LatLng[]) => {
    if (!mapRef.current || pts.length === 0) return;

    if (pts.length === 1) {
      const c = pts[0];
      // Hier kannst du noch „enger“ zoomen, z. B. 0.005/0.005:
      const tight: Region = {
        latitude: c.latitude,
        longitude: c.longitude,
        latitudeDelta: DELTA,
        longitudeDelta: DELTA,
      };
      mapRef.current.animateToRegion(tight, 250);
    } else {
      // Bounding-Box über alle Punkte
      (mapRef.current as any).fitToCoordinates(pts, {
        edgePadding: EDGE_PADDING,
        animated: true,
      });
    }
  }, []);

  // ---------- Koordinaten aus deinen Locations für fitToCoordinates ----------
  const coords: LatLng[] = useMemo(
    () =>
      shownLocations.map((l) => ({
        latitude: l.data.latitude,
        longitude: l.data.longitude,
      })),
    [shownLocations]
  );

  // ---------- Wenn sich die angezeigten Locations ändern, zoomen wir passend ----------
  useEffect(() => {
    if (coords.length === 0) return;
    fitToItems(coords);
  }, [coords, fitToItems]);

  const handleCloseMapLocationElement = useCallback(
    () => setPressedLocation(undefined),
    []
  );

  // ---------- Optional: eigenes Cluster-Rendering (mit A11y) ----------
  const renderCluster = useCallback((cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const count = properties.point_count;
    const c = {
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
    };

    return (
      <Marker key={`cluster-${id}`} coordinate={c} onPress={onPress}>
        <View style={styles.cluster}>
          <Text style={styles.clusterText}>{count}</Text>
        </View>
      </Marker>
    );
  }, []);

  return (
    <View style={styles.container}>
      <ClusteredMapView
        ref={mapRef}
        initialRegion={region}
        // region={region}
        onPress={handlePressMap}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation
        showsMyLocationButton
        mapType={mapType}
        userInterfaceStyle='light'
        customMapStyle={lightMapStyle}
        // Clustering-Feintuning: je nach Dichte kannst du radius/extents anpassen
        radius={70}
        extent={512}
        maxZoom={20}
        spiralEnabled
        renderCluster={renderCluster}
      >
        {location && (
          <Marker
            title={location.data.name}
            coordinate={{
              latitude: location.data.latitude,
              longitude: location.data.longitude,
            }}
          />
        )}
        {shownLocations &&
          shownLocations.map((loc) => {
            const isActive = pressedLocation && location === pressedLocation;
            const key = `${loc.belonging ?? 'x'}-${loc.id}-${
              loc.data.name ?? ''
            }`;
            return (
              <MapsMarker
                location={loc}
                key={key}
                active={isActive}
                onPressMarker={setPressedLocation.bind(location)}
              />
            );
          })}
      </ClusteredMapView>
      {pressedLocation && (
        <MapLocationElement
          location={pressedLocation}
          onClose={handleCloseMapLocationElement}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cluster: {
    backgroundColor: '#2FBF71',
    borderRadius: 18,
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterText: { color: '#fff', fontWeight: '700' },
});

export default ShowMap;
