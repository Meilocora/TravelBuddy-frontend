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
import { StyleSheet, View, Text } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import MapView, {
  LatLng,
  LongPressEvent,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import MapViewDirections, {
  MapViewDirectionsMode,
} from 'react-native-maps-directions';
import Constants from 'expo-constants';

import {
  Icons,
  Location,
  MapType,
  MediumLocation,
  StackParamList,
} from '../models';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
import MapsMarker from '../components/Maps/MapsMarker';
import HeaderTitle from '../components/UI/HeaderTitle';
import {
  formatMediumToLocation,
  formatPlaceToLocation,
  getRegionForLocations,
} from '../utils/location';
import { CustomCountryContext } from '../store/custom-country-context';
import IconButton from '../components/UI/IconButton';
import MapLocationElement from '../components/Maps/MapLocationElement/MapLocationElement';
import { usePersistedState } from '../hooks/usePersistedState';
import MapSettings from '../components/Maps/MapSettings';
import OpenRouteInGoogleMapsButton from '../components/Maps/OpenRouteInGoogleMapsButton';
import RouteInfo, { RouteInfoType } from '../components/Maps/RouteInfo';
import { MediumContext } from '../store/medium-context';
import MediumMarker from '../components/Maps/MediumMarker';
import { DELTA, EDGE_PADDING } from '../constants/maps';
import { Medium } from '../models/media';
import MediaModal from '../components/UI/MediaModal';

interface ShowMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ShowMap'>;
  route: RouteProp<StackParamList, 'ShowMap'>;
}

const ShowMap: React.FC<ShowMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const customCountryCtx = useContext(CustomCountryContext);
  const mediumCtx = useContext(MediumContext);

  const mapRef = useRef<MapView>(null);

  const location = route.params.location;
  const customCountryIds = route.params.customCountryIds;

  const [showSettings, setShowSettings] = useState(false);
  const [isFav, setIsFav] = useState(true);
  const [isVisited, setIsVisited] = useState(true);
  const [showMedia, setShowMedia] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: location?.data.latitude || 0,
    longitude: location?.data.longitude || 0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  });
  const [pressedLocation, setPressedLocation] = useState<
    Location | undefined
  >();
  const [showMediumModal, setShowMediumModal] = useState<Medium | undefined>();
  const [routePoints, setRoutePoints] = useState<LatLng[] | undefined>();
  const [directionsMode, setDirectionsMode] =
    usePersistedState<MapViewDirectionsMode>('map_directions_mode', 'DRIVING');
  const [routeInfo, setRouteInfo] = useState<RouteInfoType | null>(null);
  const [hasInitialZoom, setHasInitialZoom] = useState(false);
  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;

  const shownLocations: Location[] = useMemo(() => {
    let locations: Location[] = [];
    for (const id of customCountryIds) {
      const placesToVisit = customCountryCtx.findCountriesPlaces(id);
      const newLocations = placesToVisit
        ? placesToVisit.map(formatPlaceToLocation)
        : [];
      locations.push(...newLocations);
    }

    if (!isFav) {
      locations = locations.filter((place) => place.favourite === true);
    }

    if (!isVisited) {
      locations = locations.filter((place) => place.done !== true);
    }

    return locations;
  }, [customCountryIds, customCountryCtx, isFav, isVisited]);

  let mediaLocations: MediumLocation[] = [];
  if (showMedia) {
    for (const m of mediumCtx.media) {
      const mLoc = formatMediumToLocation(m);
      mLoc && mediaLocations.push(mLoc);
    }
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
            containerStyle={styles.icon}
          />
          <IconButton
            icon={isVisited ? Icons.eye : Icons.eyeOn}
            onPress={() => setIsVisited((prevValue) => !prevValue)}
            size={26}
            color={GlobalStyles.colors.visited}
            containerStyle={styles.icon}
          />
          <IconButton
            size={24}
            icon={showSettings ? Icons.settingsFilled : Icons.settingsOutline}
            onPress={() => setShowSettings((prevValue) => !prevValue)}
            containerStyle={styles.icon}
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
  const fitToItems = useCallback(
    (pts: LatLng[], isInitial: boolean = false) => {
      if (!mapRef.current || pts.length === 0) return;

      if (location && isInitial && !hasInitialZoom) {
        setTimeout(() => {
          if (!mapRef.current) return;
          const tight: Region = {
            latitude: location.data.latitude,
            longitude: location.data.longitude,
            latitudeDelta: DELTA,
            longitudeDelta: DELTA,
          };
          mapRef.current.animateToRegion(tight, 250);
          setHasInitialZoom(true);
        }, 1000);
        return;
      }

      if (pts.length === 1) {
        const c = pts[0];
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
    },
    [location, hasInitialZoom]
  );

  const coords: LatLng[] = useMemo(
    () =>
      shownLocations.map((l) => ({
        latitude: l.data.latitude,
        longitude: l.data.longitude,
      })),
    [shownLocations]
  );

  // Initial fit screen
  useEffect(() => {
    if (hasInitialZoom) return;
    if (coords.length === 0) return;

    fitToItems(coords, true);
  }, [coords, fitToItems, hasInitialZoom]);

  // fit screen, when route is shown
  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return;

    let allCoords = [...routePoints];

    fitToItems(allCoords, false);
  }, [routePoints, fitToItems]);

  const renderCluster = useCallback((cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const count = properties.point_count;
    const c = {
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
    };

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={c}
        onPress={onPress}
        style={{ zIndex: 50 }}
      >
        <View style={styles.cluster}>
          <Text style={styles.clusterText}>{count}</Text>
        </View>
      </Marker>
    );
  }, []);

  const handlePressMarker = useCallback((location: Location) => {
    setPressedLocation(location);

    // Map auf den Marker zentrieren
    if (mapRef.current) {
      const { latitude, longitude } = location.data;
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: DELTA,
        longitudeDelta: DELTA,
      };
      mapRef.current.animateToRegion(region, 250);
    }
  }, []);

  function handleCloseMapLocationElement() {
    setPressedLocation(undefined);
    fitToItems(coords, true);
  }

  function handlePressMediumMarker(location: MediumLocation) {
    const localMedium = mediumCtx.findMedium(location.id);
    setShowMediumModal(localMedium);
  }

  function handleLongPress(e: LongPressEvent) {
    if (routePoints?.length === 25) return;
    const lat = e.nativeEvent.coordinate.latitude;
    const lng = e.nativeEvent.coordinate.longitude;
    const newPoint = { latitude: lat, longitude: lng };

    setRoutePoints((prevPoints) =>
      prevPoints ? [...prevPoints, newPoint] : [newPoint]
    );
  }

  function handleAddRoutePoint(coord: LatLng) {
    if (routePoints?.length === 25) return;
    setRoutePoints((prevPoints) =>
      prevPoints ? [...prevPoints, coord] : [coord]
    );
  }

  function handleDeleteRoute() {
    setRoutePoints(undefined);
    setRouteInfo(null);
    fitToItems(coords, true);
  }

  return (
    <View style={styles.container}>
      <MediaModal
        medium={showMediumModal}
        onClose={() => setShowMediumModal(undefined)}
        visible={typeof showMediumModal !== 'undefined'}
        onCalcRoute={(localCoords: LatLng) => setRoutePoints([localCoords])}
      />
      {showSettings && (
        <MapSettings
          onClose={() => setShowSettings(false)}
          mode={directionsMode}
          setMode={(m: MapViewDirectionsMode) => setDirectionsMode(m)}
          setMapType={setMapType}
          mapType={mapType}
          toggleShowMedia={() => setShowMedia((prevValue) => !prevValue)}
          showMedia={showMedia}
        />
      )}
      <ClusteredMapView
        ref={mapRef}
        initialRegion={region}
        onPress={handlePressMap}
        onLongPress={handleLongPress}
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
        clusteringEnabled={!routePoints || routePoints.length === 0}
      >
        {routePoints && routePoints.length > 1 && (
          <MapViewDirections
            apikey={GOOGLE_API_KEY}
            origin={routePoints[0]}
            destination={routePoints[routePoints.length - 1]}
            waypoints={
              routePoints.length > 2 ? routePoints.slice(1, -1) : undefined
            }
            strokeWidth={4}
            strokeColor='blue'
            precision='high'
            mode={directionsMode}
            onError={() => setRouteInfo({ display: true })}
            onReady={(result) => {
              setRouteInfo({
                distance: result.distance, // in kilometers
                duration: result.duration, // in minutes
                display: true,
              });
            }}
          />
        )}
        {routePoints &&
          routePoints.map((pt, index) => (
            <Marker
              key={`route-point-${index}`}
              coordinate={pt}
              draggable
              pinColor='blue'
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setRoutePoints((prev) => {
                  if (!prev) return prev;
                  const updated = [...prev];
                  updated[index] = { latitude, longitude };
                  return updated;
                });
              }}
            />
          ))}
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
                onPressMarker={handlePressMarker}
              />
            );
          })}
        {mediaLocations &&
          mediaLocations.map((loc) => {
            return (
              <MediumMarker
                mediumLocation={loc}
                key={loc.url}
                onPressMarker={handlePressMediumMarker}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
              />
            );
          })}
      </ClusteredMapView>
      {routeInfo?.display && (
        <RouteInfo
          onClose={() => setRouteInfo(null)}
          onDeleteRoute={handleDeleteRoute}
          routeInfo={routeInfo}
        />
      )}
      {routePoints && routePoints?.length > 1 && (
        <OpenRouteInGoogleMapsButton
          routePoints={routePoints}
          startPoint={routePoints[0]}
        />
      )}
      {pressedLocation && (
        <MapLocationElement
          location={pressedLocation}
          onClose={handleCloseMapLocationElement}
          addRoutePoint={handleAddRoutePoint}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    padding: 0,
    margin: 0,
  },
  cluster: {
    backgroundColor: GlobalStyles.colors.grayDark,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.graySoft,
    minWidth: 44,
    height: 44,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: {
    color: GlobalStyles.colors.graySoft,
    fontWeight: '700',
    fontSize: 24,
  },
});

export default ShowMap;
