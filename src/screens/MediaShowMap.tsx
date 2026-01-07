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
import Constants from 'expo-constants';
import MapViewDirections, {
  MapViewDirectionsMode,
} from 'react-native-maps-directions';

import { Icons, MapType, MediumLocation, StackParamList } from '../models';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
import HeaderTitle from '../components/UI/HeaderTitle';
import {
  formatMediumToLocation,
  getRegionForMediumLocations,
} from '../utils/location';
import IconButton from '../components/UI/IconButton';
import { usePersistedState } from '../hooks/usePersistedState';
import { MediumContext } from '../store/medium-context';
import { UserContext } from '../store/user-context';
import { Medium } from '../models/media';
import MapSettings from '../components/Maps/MapSettings';
import OpenRouteInGoogleMapsButton from '../components/Maps/OpenRouteInGoogleMapsButton';
import RouteInfo, { RouteInfoType } from '../components/Maps/RouteInfo';
import {
  DELTA,
  EDGE_PADDING,
  EXTENT,
  MAXZOOM,
  RADIUS,
} from '../constants/maps';
import MediumMarker from '../components/Maps/MediumMarker';
import MediaModal from '../components/UI/MediaModal';

interface MediaShowMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'MediaShowMap'>;
  route: RouteProp<StackParamList, 'MediaShowMap'>;
}

const MediaShowMap: React.FC<MediaShowMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const mediumCtx = useContext(MediumContext);
  const userCtx = useContext(UserContext);

  const mapRef = useRef<MapView>(null);

  const mediumLocation = route.params.mediumLocation;

  const [showSettings, setShowSettings] = useState(false);
  const [isFav, setIsFav] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude:
      mediumLocation?.latitude || userCtx.currentLocation?.latitude || 0,
    longitude:
      mediumLocation?.longitude || userCtx.currentLocation?.longitude || 0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  });
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

  let shownLocations: MediumLocation[] = [];
  for (const m of mediumCtx.media) {
    const mLocation = formatMediumToLocation(m);
    if (
      mLocation &&
      mLocation.latitude !== mediumLocation?.latitude &&
      mLocation.longitude !== mediumLocation?.longitude
    ) {
      shownLocations.push(mLocation);
    }
  }

  if (!isFav) {
    shownLocations = shownLocations.filter((place) => place.favourite === true);
  }

  useEffect(() => {
    async function calculateRegion() {
      if (shownLocations && !mediumLocation) {
        setRegion(await getRegionForMediumLocations(shownLocations));
      }
    }
    calculateRegion();
  }, [route.params]);

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
            size={24}
            icon={showSettings ? Icons.settingsFilled : Icons.settingsOutline}
            onPress={() => setShowSettings((prevValue) => !prevValue)}
            containerStyle={styles.icon}
          />
        </>
      ),
      headerStyle: { backgroundColor: GlobalStyles.colors.greenBg },
      headerTintColor: GlobalStyles.colors.grayDark,
    });
  }, [isFav]);

  function handlePressMap(event: MapPressEvent) {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;

    navigation.navigate('ManageMedium', {
      lat: lat,
      lng: lng,
    });
  }

  const fitToItems = useCallback(
    (pts: LatLng[], isInitial: boolean = false) => {
      if (!mapRef.current || pts.length === 0) return;

      if (mediumLocation && isInitial && !hasInitialZoom) {
        setTimeout(() => {
          if (!mapRef.current) return;
          const tight: Region = {
            latitude: mediumLocation.latitude,
            longitude: mediumLocation.longitude,
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
    []
  );

  const coords: LatLng[] = useMemo(
    () =>
      shownLocations.map((l) => ({
        latitude: l.latitude,
        longitude: l.longitude,
      })),
    [shownLocations]
  );

  useEffect(() => {
    // nichts zu tun, wenn weder coords noch routePoints da sind
    if (coords.length === 0 && !routePoints) return;

    let allCoords = [];

    if (routePoints && routePoints.length >= 2) {
      // Case 1: min. 2 routePoints -> only focus on them
      allCoords = [...routePoints];
    } else {
      // Case 2: less than 2 routePoints -> adjust screen to all locations
      allCoords = [...coords];

      if (mediumLocation) {
        allCoords.push({
          latitude: mediumLocation.latitude,
          longitude: mediumLocation.longitude,
        });
      }
    }

    if (allCoords.length === 0) return;

    fitToItems(allCoords, !hasInitialZoom);
  }, [coords, routePoints, mediumLocation, fitToItems, hasInitialZoom]);

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
        tracksViewChanges={false}
      >
        <View style={styles.cluster}>
          <Text style={styles.clusterText}>{count}</Text>
        </View>
      </Marker>
    );
  }, []);

  function handlePressMarker(location: MediumLocation) {
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

  function handleDeleteRoute() {
    setRoutePoints(undefined);
    setRouteInfo(null);
  }

  return (
    <View style={styles.container}>
      {showMediumModal && (
        <MediaModal
          medium={showMediumModal}
          onClose={() => setShowMediumModal(undefined)}
          visible={typeof showMediumModal !== 'undefined'}
          onCalcRoute={(localCoords: LatLng) => setRoutePoints([localCoords])}
        />
      )}
      {showSettings && (
        <MapSettings
          onClose={() => setShowSettings(false)}
          mode={directionsMode}
          setMode={(m: MapViewDirectionsMode) => setDirectionsMode(m)}
          setMapType={setMapType}
          mapType={mapType}
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
        // Clustering: adjust radius/ extends here
        radius={RADIUS}
        extent={EXTENT}
        maxZoom={MAXZOOM}
        spiralEnabled
        renderCluster={renderCluster}
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
              tracksViewChanges={false}
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
        {mediumLocation && (
          <MediumMarker
            mediumLocation={mediumLocation}
            key={mediumLocation.url}
            active={true}
            onPressMarker={handlePressMarker}
            coordinate={{
              latitude: mediumLocation.latitude,
              longitude: mediumLocation.longitude,
            }}
          />
        )}
        {shownLocations &&
          shownLocations.map((loc) => {
            return (
              <MediumMarker
                mediumLocation={loc}
                key={loc.url}
                onPressMarker={handlePressMarker}
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

export default MediaShowMap;
