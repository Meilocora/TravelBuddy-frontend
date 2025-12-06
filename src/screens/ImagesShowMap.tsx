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
import { StyleSheet, View, Text, Pressable } from 'react-native';
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

import { Icons, ImageLocation, MapType, StackParamList } from '../models';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
import HeaderTitle from '../components/UI/HeaderTitle';
import {
  formatImageToLocation,
  getRegionForImageLocations,
} from '../utils/location';
import { formatRouteDuration } from '../utils';
import IconButton from '../components/UI/IconButton';
import { usePersistedState } from '../hooks/usePersistedState';
import { ImageContext } from '../store/image-context';
import { UserContext } from '../store/user-context';
import ImageMarker from '../components/Maps/ImageMarker';
import { Image } from '../models/image';
import ImageModal from '../components/UI/ImageModal';
import MapViewDirections, {
  MapViewDirectionsMode,
} from 'react-native-maps-directions';
import Popup from '../components/UI/Popup';
import MapSettings from '../components/Maps/MapSettings';

interface ImagesShowMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ImagesShowMap'>;
  route: RouteProp<StackParamList, 'ImagesShowMap'>;
}

const DELTA = 0.005;

const EDGE_PADDING = { top: 60, right: 60, bottom: 60, left: 60 };

const ImagesShowMap: React.FC<ImagesShowMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const imagesCtx = useContext(ImageContext);
  const userCtx = useContext(UserContext);

  const mapRef = useRef<MapView>(null);

  const imageLocation = route.params.imageLocation;

  const [showSettings, setShowSettings] = useState(false);
  const [isFav, setIsFav] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: imageLocation?.latitude || userCtx.currentLocation?.latitude || 0,
    longitude:
      imageLocation?.longitude || userCtx.currentLocation?.longitude || 0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  });
  const [showImageModal, setShowImageModal] = useState<Image | undefined>();
  const [routePoints, setRoutePoints] = useState<LatLng[] | undefined>();
  const [directionsMode, setDirectionsMode] =
    usePersistedState<MapViewDirectionsMode>('map_directions_mode', 'DRIVING');
  const [popupText, setPopupText] = useState<string | undefined>();
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const [hasInitialZoom, setHasInitialZoom] = useState(false);

  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;

  let shownLocations: ImageLocation[] = [];
  for (const img of imagesCtx.images) {
    const imgLocation = formatImageToLocation(img);
    if (
      imgLocation &&
      imgLocation.latitude !== imageLocation?.latitude &&
      imgLocation.longitude !== imageLocation?.longitude
    ) {
      shownLocations.push(imgLocation);
    }
  }

  if (!isFav) {
    shownLocations = shownLocations.filter((place) => place.favourite === true);
  }

  useEffect(() => {
    async function calculateRegion() {
      if (shownLocations && !imageLocation) {
        setRegion(await getRegionForImageLocations(shownLocations));
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

    navigation.navigate('ManageImage', {
      lat: lat,
      lng: lng,
    });
  }

  // ---------- „Nah heranzoomen": 1 Punkt = enge Region, >1 Punkt = Bounding-Box ----------
  const fitToItems = useCallback(
    (pts: LatLng[], isInitial: boolean = false) => {
      if (!mapRef.current || pts.length === 0) return;

      if (imageLocation && isInitial && !hasInitialZoom) {
        setTimeout(() => {
          if (!mapRef.current) return;
          const tight: Region = {
            latitude: imageLocation.latitude,
            longitude: imageLocation.longitude,
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
        latitude: l.latitude,
        longitude: l.longitude,
      })),
    [shownLocations]
  );

  // ---------- Wenn sich die angezeigten Locations ändern, zoomen wir passend ----------
  useEffect(() => {
    if (coords.length === 0 && !routePoints) return;
    let allCoords = coords;
    if (routePoints) {
      allCoords = allCoords.concat(routePoints);
    }
    if (imageLocation) {
      allCoords = allCoords.concat([
        {
          latitude: imageLocation.latitude,
          longitude: imageLocation.longitude,
        },
      ]);
    }
    fitToItems(allCoords, !hasInitialZoom);
  }, [coords, fitToItems, hasInitialZoom]);

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

  function handlePressMarker(location: ImageLocation) {
    const localImage = imagesCtx.findImage(location.id);
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
        // Clustering: adjust radius/ extends here
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
        {imageLocation && (
          <ImageMarker
            imageLocation={imageLocation}
            key={imageLocation.url}
            active={true}
            onPressMarker={handlePressMarker}
            coordinate={{
              latitude: imageLocation.latitude,
              longitude: imageLocation.longitude,
            }}
          />
        )}
        {shownLocations &&
          shownLocations.map((loc) => {
            return (
              <ImageMarker
                imageLocation={loc}
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
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Pressable
            onPress={() => setRouteInfo(null)}
            style={styles.routeInfoTextContainer}
          >
            <Text style={styles.routeInfoText}>
              Distance: {routeInfo.distance.toFixed(1)} km | Time:{' '}
              {formatRouteDuration(routeInfo.duration)}
            </Text>
          </Pressable>
          <IconButton
            icon={Icons.delete}
            onPress={handleDeleteRoute}
            color={GlobalStyles.colors.graySoft}
            containerStyle={styles.deleteIcon}
          />
        </View>
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
  routeInfoContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
  },
  routeInfoTextContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  routeInfoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteIcon: {
    marginHorizontal: 'auto',
    backgroundColor: GlobalStyles.colors.grayDark,
    borderRadius: 50,
  },
});

export default ImagesShowMap;
