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
  ImageLocation,
  Location,
  MapType,
  StackParamList,
} from '../models';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
import MapsMarker from '../components/Maps/MapsMarker';
import HeaderTitle from '../components/UI/HeaderTitle';
import {
  formatImageToLocation,
  formatPlaceToLocation,
  getRegionForLocations,
} from '../utils/location';
import { CustomCountryContext } from '../store/custom-country-context';
import IconButton from '../components/UI/IconButton';
import MapLocationElement from '../components/Maps/MapLocationElement/MapLocationElement';
import { usePersistedState } from '../hooks/usePersistedState';
import ImageModal from '../components/UI/ImageModal';
import MapSettings from '../components/Maps/MapSettings';
import Popup from '../components/UI/Popup';
import OpenRouteInGoogleMapsButton from '../components/Maps/OpenRouteInGoogleMapsButton';
import RouteInfo, { RouteInfoType } from '../components/Maps/RouteInfo';
import { UserContext } from '../store/user-context';
import { ImageContext } from '../store/image-context';
import { Image as ImageType } from '../models/image';
import ImageMarker from '../components/Maps/ImageMarker';

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
  const userCtx = useContext(UserContext);
  const imageCtx = useContext(ImageContext);

  const mapRef = useRef<MapView>(null);

  const location = route.params.location;
  const customCountryIds = route.params.customCountryIds;

  const [showSettings, setShowSettings] = useState(false);
  const [isFav, setIsFav] = useState(true);
  const [isVisited, setIsVisited] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: location?.data.latitude || 0,
    longitude: location?.data.longitude || 0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  });
  const [pressedLocation, setPressedLocation] = useState<
    Location | undefined
  >();
  const [showImageModal, setShowImageModal] = useState<ImageType | undefined>();
  const [routePoints, setRoutePoints] = useState<LatLng[] | undefined>();
  const [directionsMode, setDirectionsMode] =
    usePersistedState<MapViewDirectionsMode>('map_directions_mode', 'DRIVING');
  const [popupText, setPopupText] = useState<string | undefined>();
  const [routeInfo, setRouteInfo] = useState<RouteInfoType | null>(null);
  const [hasInitialZoom, setHasInitialZoom] = useState(false);
  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;

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

  let imageLocations: ImageLocation[] = [];
  if (showImages) {
    for (const img of imageCtx.images) {
      const imgLoc = formatImageToLocation(img);
      imgLoc && imageLocations.push(imgLoc);
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
    []
  );

  // ---------- Koordinaten aus deinen Locations für fitToCoordinates ----------
  const coords: LatLng[] = useMemo(
    () =>
      shownLocations.map((l) => ({
        latitude: l.data.latitude,
        longitude: l.data.longitude,
      })),
    [shownLocations]
  );

  useEffect(() => {
    // nichts zu tun, wenn weder coords noch routePoints da sind
    if (coords.length === 0 && !routePoints) return;

    let allCoords = [];

    if (routePoints && routePoints.length >= 2) {
      // Case 1: min. 2 routePoints -> only focus on them + users current location
      allCoords = [...routePoints];
      if (userCtx.currentLocation) {
        allCoords.unshift({
          latitude: userCtx.currentLocation.latitude,
          longitude: userCtx.currentLocation.longitude,
        });
      }
    } else {
      // Case 2: less than 2 routePoints -> adjust screen to all locations
      allCoords = [...coords];
    }

    if (pressedLocation) {
      allCoords = [pressedLocation.data];
    }

    if (allCoords.length === 0) return;

    fitToItems(allCoords, !hasInitialZoom);
  }, [coords, routePoints, pressedLocation, fitToItems, hasInitialZoom]);

  // ---------- Optional: eigenes Cluster-Rendering (mit A11y) ----------
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

  function handlePressImageMarker(location: ImageLocation) {
    const localImage = imageCtx.findImage(location.id);
    setShowImageModal(localImage);
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
  }

  return (
    <View style={styles.container}>
      <ImageModal
        image={showImageModal}
        link={showImageModal?.url || ''}
        onClose={() => setShowImageModal(undefined)}
        visible={typeof showImageModal !== 'undefined'}
        onCalcRoute={(localCoords: LatLng) => setRoutePoints([localCoords])}
      />
      {showSettings && (
        <MapSettings
          onClose={() => setShowSettings(false)}
          mode={directionsMode}
          setMode={(m: MapViewDirectionsMode) => setDirectionsMode(m)}
          setMapType={setMapType}
          mapType={mapType}
          toggleShowImages={() => setShowImages((prevValue) => !prevValue)}
          showImages={showImages}
        />
      )}
      {popupText && (
        <Popup content={popupText} onClose={() => setPopupText(undefined)} />
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
      >
        {routePoints && routePoints.length > 0 && (
          <MapViewDirections
            apikey={GOOGLE_API_KEY}
            origin={userCtx.currentLocation}
            destination={routePoints[routePoints.length - 1]}
            waypoints={
              routePoints.length > 1 ? routePoints.slice(0, -1) : undefined
            }
            strokeWidth={4}
            strokeColor='blue'
            precision='high'
            mode={directionsMode}
            onError={() => setPopupText('No route found...')}
            onReady={(result) => {
              setRouteInfo({
                distance: result.distance, // in kilometers
                duration: result.duration, // in minutes
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
                onPressMarker={setPressedLocation.bind(location)}
              />
            );
          })}
        {imageLocations &&
          imageLocations.map((loc) => {
            return (
              <ImageMarker
                imageLocation={loc}
                key={loc.url}
                onPressMarker={handlePressImageMarker}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
              />
            );
          })}
      </ClusteredMapView>
      {routeInfo && (
        <RouteInfo
          onClose={() => setRouteInfo(null)}
          onDeleteRoute={handleDeleteRoute}
          routeInfo={routeInfo}
        />
      )}
      {routePoints && (
        <OpenRouteInGoogleMapsButton
          routePoints={routePoints}
          startPoint={userCtx.currentLocation}
        />
      )}
      {pressedLocation && (
        <MapLocationElement
          location={pressedLocation}
          onClose={() => setPressedLocation(undefined)}
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
