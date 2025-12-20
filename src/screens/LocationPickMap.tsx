import 'react-native-get-random-values';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { RouteProp } from '@react-navigation/native';
import MapView, {
  LatLng,
  LongPressEvent,
  MapPressEvent,
  Marker,
  PoiClickEvent,
  Region,
} from 'react-native-maps';
import GooglePlacesTextInput from 'react-native-google-places-textinput';
import MapViewDirections, {
  MapViewDirectionsMode,
} from 'react-native-maps-directions';

import {
  ColorScheme,
  PlaceToVisit,
  StackParamList,
  Location,
  FormLimits,
  MapType,
  Icons,
} from '../models';
import Modal from '../components/UI/Modal';
import { GlobalStyles, lightMapStyle } from '../constants/styles';
import Button from '../components/UI/Button';
import {
  formatPlaceToLocation,
  getMapLocationsFromJourney,
  getPlaceDetails,
  getRegionForLocations,
} from '../utils/location';
import { CustomCountryContext } from '../store/custom-country-context';
import MapsMarker from '../components/Maps/MapsMarker';
import { generateRandomString } from '../utils';
import HeaderTitle from '../components/UI/HeaderTitle';
import { StagesContext } from '../store/stages-context';
import { usePersistedState } from '../hooks/usePersistedState';
import MapSettings from '../components/Maps/MapSettings';
import RouteInfo, { RouteInfoType } from '../components/Maps/RouteInfo';
import OpenRouteInGoogleMapsButton from '../components/Maps/OpenRouteInGoogleMapsButton';
import { UserContext } from '../store/user-context';
import IconButton from '../components/UI/IconButton';
import { DELTA } from '../constants/maps';

interface LocationPickMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'LocationPickMap'>;
  route: RouteProp<StackParamList, 'LocationPickMap'>;
}

const LocationPickMap: React.FC<LocationPickMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const customCountryCtx = useContext(CustomCountryContext);
  const stagesCtx = useContext(StagesContext);

  const mapRef = useRef<MapView>(null);

  const initialCoord =
    route.params?.initialLat && route.params?.initialLng
      ? {
          latitude: route.params.initialLat,
          longitude: route.params.initialLng,
        }
      : null;

  const [showSettings, setShowSettings] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<LatLng | null>(
    route.params.hasLocation ? initialCoord : null
  );

  const noMapTouch = route.params.noMapTouch || false;
  const initialLocation = route.params && {
    lat: route.params.initialLat,
    lng: route.params.initialLng,
  };
  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;

  const initialColorScheme = route.params.colorScheme || ColorScheme.primary;

  const customCountryIds = route.params.customCountryIds || undefined;
  const minorStageId = route.params.minorStageId;
  const majorStageId = route.params.majorStageId;

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLocation, setHasLocation] = useState(route.params.hasLocation);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation.lat,
    longitude: initialLocation.lng,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  });
  const [title, setTitle] = useState<string | undefined>(
    route.params.initialTitle
  );
  const [showModal, setShowModal] = useState(false);
  const [routePoints, setRoutePoints] = useState<LatLng[] | undefined>();
  const [directionsMode, setDirectionsMode] =
    usePersistedState<MapViewDirectionsMode>('map_directions_mode', 'DRIVING');
  const [routeInfo, setRouteInfo] = useState<RouteInfoType | null>(null);
  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );

  let placesToVisit: undefined | PlaceToVisit[] = undefined;
  let journeysLocations: undefined | Location[];

  if (customCountryIds) {
    for (const id of customCountryIds) {
      const additionalPlaces = customCountryCtx.findCountriesPlaces(id);
      if (!additionalPlaces) continue;
      if (typeof placesToVisit === 'undefined') {
        placesToVisit = additionalPlaces;
      } else {
        placesToVisit = placesToVisit.concat(additionalPlaces);
      }
    }
  }

  if (majorStageId) {
    const journey = stagesCtx.findMajorStagesJourney(majorStageId)!;
    journeysLocations = getMapLocationsFromJourney(journey, true);
  }

  // Update the useEffect
  useEffect(() => {
    async function calculateAverageRegion() {
      // Only calculate average region on initial load
      if (!placesToVisit || placesToVisit.length === 0 || !isInitialLoad)
        return;

      const locationsToVisit = placesToVisit.map(formatPlaceToLocation);
      const newRegion = await getRegionForLocations(locationsToVisit);

      setRegion(newRegion);
      setIsInitialLoad(false); // Mark initial load as complete
    }

    calculateAverageRegion();
  }, [placesToVisit, isInitialLoad]);

  function selectLocationHandler(e: MapPressEvent) {
    const lat = e.nativeEvent.coordinate.latitude;
    const lng = e.nativeEvent.coordinate.longitude;

    const nextRegion: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: DELTA,
      longitudeDelta: DELTA,
    };

    setSelectedCoord({ latitude: lat, longitude: lng }); // Marker-Source
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 250); // Move Camera
    setHasLocation(true);
    setIsInitialLoad(false);
    setShowModal(true);
  }

  function handlePoiClick(event: PoiClickEvent) {
    const { coordinate, name } = event.nativeEvent;
    setRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.04,
    });
    setTitle(name.substring(0, FormLimits.place));
    setHasLocation(true);
    setIsInitialLoad(false); // Prevent future auto-calculations
    setShowModal(true);
  }

  async function handleSearchResult(place: any) {
    if (place) {
      const latLng: LatLng = await getPlaceDetails(place);
      const nextRegion: Region = {
        latitude: latLng.latitude,
        longitude: latLng.longitude,
        latitudeDelta: DELTA,
        longitudeDelta: DELTA,
      };
      setSelectedCoord({
        latitude: latLng.latitude,
        longitude: latLng.longitude,
      }); // Marker-Source
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 250);
      setTitle(
        place.structuredFormat.mainText.text.substring(0, FormLimits.place)
      );
      setHasLocation(true);
      setIsInitialLoad(false); // Prevent future auto-calculations
      setShowModal(true);
    }
    return;
  }

  function handleSelectPlace() {
    route.params.onPickLocation({
      title: title,
      lat: selectedCoord!.latitude,
      lng: selectedCoord!.longitude,
    });
    navigation.goBack();
  }

  function handleResetPlace() {
    if (route.params.onResetLocation) {
      route.params.onResetLocation();
      navigation.goBack();
    }
  }

  function handlePressMarker(location: Location) {
    if (route.params.onPressMarker) {
      route.params.onPressMarker({
        title: location.data.name,
        lat: location.data.latitude,
        lng: location.data.longitude,
      });
      navigation.goBack();
    } else if (route.params.onAddLocation) {
      route.params.onAddLocation(location);
    }
  }

  let mainColor = GlobalStyles.colors.greenBg;
  if (initialColorScheme === ColorScheme.complementary) {
    mainColor = GlobalStyles.colors.purpleBg;
  } else if (initialColorScheme === ColorScheme.accent) {
    mainColor = GlobalStyles.colors.amberBg;
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={'Pick a Location'} />,
      headerRight: () => (
        <IconButton
          size={24}
          icon={showSettings ? Icons.settingsFilled : Icons.settingsOutline}
          onPress={() => setShowSettings((prevValue) => !prevValue)}
        />
      ),
      headerStyle: { backgroundColor: mainColor },
      headerTintColor: GlobalStyles.colors.grayDark,
    });
  }, []);

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
      {showSettings && (
        <MapSettings
          onClose={() => setShowSettings(false)}
          mode={directionsMode}
          setMode={(m: MapViewDirectionsMode) => setDirectionsMode(m)}
          setMapType={setMapType}
          mapType={mapType}
        />
      )}
      {showModal && (
        <Modal
          content='Do you want to add this place?'
          title='Add Place'
          confirmText='Confirm'
          onCancel={() => setShowModal(false)}
          onConfirm={handleSelectPlace}
          positiveConfirm
          containerStyle={styles.modal}
        />
      )}
      {route.params.onResetLocation && (
        <GooglePlacesTextInput
          apiKey={GOOGLE_API_KEY}
          onPlaceSelect={handleSearchResult}
          placeHolderText='Search for a location'
          minCharsToFetch={3}
          style={{
            container: styles.searchContainer,
            textInput: styles.searchInput,
          }}
        />
      )}
      <MapView
        ref={mapRef}
        initialRegion={region}
        onPress={noMapTouch ? undefined : selectLocationHandler}
        onLongPress={handleLongPress}
        onPoiClick={handlePoiClick}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        mapType={mapType}
        userInterfaceStyle='light'
        customMapStyle={lightMapStyle}
      >
        {routePoints && routePoints.length > 1 && (
          <MapViewDirections
            apikey={GOOGLE_API_KEY}
            origin={routePoints[0]}
            destination={routePoints[routePoints.length - 1]}
            waypoints={
              routePoints.length > 1 ? routePoints.slice(0, -1) : undefined
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
        {!minorStageId && (selectedCoord || initialCoord) && (
          <Marker title={title} coordinate={(selectedCoord || initialCoord)!} />
        )}
        {placesToVisit &&
          placesToVisit.map((place) => {
            // Check if this place is part of the minorStage
            let isActive = false;
            if (minorStageId) {
              const minorStage = stagesCtx.findMinorStage(minorStageId);
              if (minorStage && minorStage.placesToVisit) {
                isActive = minorStage.placesToVisit.some(
                  (p) => p.name === place.name
                );
              }
            }

            return (
              <MapsMarker
                location={formatPlaceToLocation(place)}
                key={generateRandomString()}
                onPressMarker={handlePressMarker}
                active={isActive}
              />
            );
          })}
        {journeysLocations &&
          journeysLocations.map((loc) => (
            <MapsMarker
              location={loc}
              key={generateRandomString()}
              active={loc.done}
              onPressMarker={handlePressMarker}
            />
          ))}
      </MapView>
      {routeInfo?.display && (
        <RouteInfo
          onClose={() => setRouteInfo(null)}
          onDeleteRoute={handleDeleteRoute}
          routeInfo={routeInfo}
          topDistance={70}
        />
      )}
      {routePoints && routePoints?.length > 1 && (
        <OpenRouteInGoogleMapsButton
          routePoints={routePoints}
          startPoint={routePoints[0]}
        />
      )}
      {route.params.onResetLocation && !routePoints && (
        <View style={styles.buttonContainer}>
          <Button colorScheme={initialColorScheme} onPress={handleResetPlace}>
            Reset Location
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '70%',
    alignSelf: 'center',
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 5,
    backgroundColor: GlobalStyles.colors.graySoft,
    paddingHorizontal: 10,
  },
  map: {
    flex: 1,
  },
  modal: {
    marginTop: '25%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    zIndex: 1,
  },
});

export default LocationPickMap;
