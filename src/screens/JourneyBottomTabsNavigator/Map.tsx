import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import Constants from 'expo-constants';
import MapView, { LatLng, Region } from 'react-native-maps';
import MapViewDirections, {
  MapViewDirectionsMode,
} from 'react-native-maps-directions';

import {
  ColorScheme,
  Icons,
  JourneyBottomTabsParamsList,
  Location,
  MapType,
  StackParamList,
} from '../../models';
import MapsMarker from '../../components/Maps/MapsMarker';
import MapScopeSelector, {
  StageData,
} from '../../components/Maps/MapScopeSelector';
import {
  addColor,
  getMapLocationsFromJourney,
  getMapLocationsFromMajorStage,
  getMapLocationsFromMinorStage,
  getRegionForLocations,
  getRemainingCountriesPlacesLocations,
} from '../../utils/location';
import MapLocationList from '../../components/Maps/MapLocationList/MapLocationList';
import Popup from '../../components/UI/Popup';
import { StagesContext } from '../../store/stages-context';
import MapLocationElement from '../../components/Maps/MapLocationElement/MapLocationElement';
import RoutePlanner from '../../components/Maps/RoutePlanner/RoutePlanner';
import { UserContext } from '../../store/user-context';
import { formatRouteDuration, generateRandomString } from '../../utils';
import IconButton from '../../components/UI/IconButton';
import MapSettings from '../../components/Maps/MapSettings';
import { CustomCountryContext } from '../../store/custom-country-context';
import { lightMapStyle } from '../../constants/styles';
import { usePersistedState } from '../../hooks/usePersistedState';

interface MapProps {
  navigation: NativeStackNavigationProp<JourneyBottomTabsParamsList, 'Map'>;
  route: RouteProp<JourneyBottomTabsParamsList, 'Map'>;
}

const Map: React.FC<MapProps> = ({ navigation, route }): ReactElement => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPastLocations, setShowPastLocations] = usePersistedState(
    'map_show_past_locations',
    false
  );
  const [showAllPlaces, setShowAllPlaces] = usePersistedState(
    'map_show_all_places',
    false
  );
  const [directionsMode, setDirectionsMode] =
    usePersistedState<MapViewDirectionsMode>('map_directions_mode', 'DRIVING');
  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );
  const [directionDestination, setDirectionDestination] =
    useState<LatLng | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [popupText, setPopupText] = useState<string | undefined>();
  const [pressedLocation, setPressedLocation] = useState<
    Location | undefined
  >();

  const [routePoints, setRoutePoints] = useState<LatLng[] | undefined>();

  const [showContent, setShowContent] = useState([
    { button: true, list: false },
    { button: true, list: false },
  ]);

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;
  const userCtx = useContext(UserContext);
  const stagesCtx = useContext(StagesContext);
  const customCountryCtx = useContext(CustomCountryContext);
  const journeyId = stagesCtx.selectedJourneyId!;
  const journey = stagesCtx.findJourney(journeyId);

  const stagesNavigation = useNavigation<NavigationProp<StackParamList>>();

  const minorStage = route.params?.minorStage;
  const majorStage = route.params?.majorStage;

  // 1) mapScope nur ABLEITEN (keinen lokalen State benutzen)
  const mapScope = useMemo(() => {
    if (route.params?.minorStage) {
      const ms = route.params.minorStage;
      return { stageType: 'MinorStage' as const, id: ms.id, name: ms.title };
    }
    if (route.params?.majorStage) {
      const ma = route.params.majorStage;
      return { stageType: 'MajorStage' as const, id: ma.id, name: ma.title };
    }
    return {
      stageType: 'Journey' as const,
      id: journeyId,
      name: journey!.name,
    };
  }, [
    route.params?.minorStage?.id,
    route.params?.majorStage?.id,
    journeyId,
    journey?.name,
  ]);

  // 2) Scope-Wechsel NUR über die Navigation-Params
  const handleChangeMapScope = useCallback(
    (next: StageData) => {
      // UI-/Routing-Zustände zurücksetzen
      setDirectionDestination(null);
      setPressedLocation(undefined);
      setRoutePoints(undefined);
      setRouteInfo(null);

      if (next.stageType === 'MinorStage') {
        const ms = stagesCtx.findMinorStage(next.id)!;
        navigation.setParams({ minorStage: ms, majorStage: undefined });
      } else if (next.stageType === 'MajorStage') {
        const ma = stagesCtx.findMajorStage(next.id)!;
        navigation.setParams({ majorStage: ma, minorStage: undefined });
      } else {
        navigation.setParams({ majorStage: undefined, minorStage: undefined });
      }
    },
    [navigation, stagesCtx]
  );

  // 3) ABLEITBARE Daten: base → country → shown
  const baseLocations = useMemo(() => {
    if (route.params?.minorStage) {
      const ms = route.params.minorStage;
      const parent = stagesCtx.findMinorStagesMajorStage(ms.id)!;
      return getMapLocationsFromMinorStage(ms, parent, showPastLocations);
    }
    if (route.params?.majorStage) {
      return getMapLocationsFromMajorStage(
        route.params.majorStage,
        showPastLocations
      );
    }
    return getMapLocationsFromJourney(journey!, showPastLocations);
  }, [
    route.params?.minorStage?.id,
    route.params?.majorStage?.id,
    journey, // falls sich Journey-Daten ändern
    showPastLocations,
    stagesCtx, // Achtung: sollte stabil sein (Context-Instanz)
  ]);

  const countryIds = useMemo(() => {
    if (route.params?.minorStage) {
      const parent = stagesCtx.findMinorStagesMajorStage(
        route.params.minorStage.id
      )!;
      return [parent.country.id!];
    }
    if (route.params?.majorStage) return [route.params.majorStage.country.id!];
    return journey?.countries ? journey.countries.map((c) => c.id) : [];
  }, [
    route.params?.minorStage?.id,
    route.params?.majorStage?.id,
    journey,
    stagesCtx,
  ]);

  const countryLocations = useMemo(() => {
    return getRemainingCountriesPlacesLocations(
      countryIds,
      baseLocations,
      customCountryCtx.findCountriesPlaces,
      showAllPlaces
    );
  }, [
    countryIds,
    baseLocations,
    customCountryCtx.findCountriesPlaces,
    showAllPlaces,
  ]);

  const shownLocations = useMemo(() => {
    return addColor(baseLocations || [], mapScope.stageType).concat(
      countryLocations
    );
  }, [baseLocations, countryLocations, mapScope.stageType]);

  // 4) Optional: Region neu berechnen, wenn sich die BASIS-Spots ändern
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!baseLocations) {
        return;
      }
      const relevant = baseLocations.filter(
        (l) =>
          l.locationType !== 'transportation_departure' &&
          l.locationType !== 'transportation_arrival'
      );
      if (relevant.length === 0) return;
      const next = await getRegionForLocations(relevant);
      if (!cancelled) setRegion(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [baseLocations, shownLocations]);

  function handleGoBack() {
    if (minorStage) {
      const localMajorStageId = stagesCtx.findMinorStagesMajorStage(
        minorStage.id
      )!.id;
      stagesNavigation.navigate('JourneyBottomTabsNavigator', {
        screen: 'MajorStageStackNavigator',
        params: {
          screen: 'MinorStages',
          params: {
            journeyId: journeyId,
            majorStageId: localMajorStageId,
          },
        },
      });
    } else {
      stagesNavigation.navigate('JourneyBottomTabsNavigator', {
        screen: 'Planning',
        params: {
          journeyId: journeyId,
        },
      });
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: ({}) => (
        <IconButton size={24} icon={Icons.arrowBack} onPress={handleGoBack} />
      ),
      headerRight: ({}) => (
        <IconButton
          size={24}
          icon={showSettings ? Icons.settingsFilled : Icons.settingsOutline}
          onPress={() => setShowSettings((prevValue) => !prevValue)}
        />
      ),
    });
  }, [navigation, majorStage, showSettings]);

  function handlePressListElement(location: Location) {
    setRegion({
      latitude: location.data.latitude,
      longitude: location.data.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.04,
    });
    setDirectionDestination({
      latitude: location.data.latitude,
      longitude: location.data.longitude,
    });
    setPressedLocation(location);
  }

  const handleChangeDirectionsMode = useCallback(
    (m: MapViewDirectionsMode) => setDirectionsMode(m),
    []
  );
  const handleClosePopup = useCallback(() => setPopupText(undefined), []);
  const handleCloseMapLocationElement = useCallback(
    () => setPressedLocation(undefined),
    []
  );

  function handleHideButtons(identifier: 'locationList' | 'routePlanner') {
    if (identifier === 'locationList') {
      if (showContent[0].button === false) {
        setShowContent([
          { button: true, list: false },
          { button: true, list: false },
        ]);
      } else {
        setShowContent([
          { button: false, list: true },
          { button: false, list: false },
        ]);
        setRoutePoints(undefined);
        setRouteInfo(null);
      }
    } else if (identifier === 'routePlanner') {
      if (showContent[1].button === false) {
        setShowContent([
          { button: true, list: false },
          { button: true, list: false },
        ]);
      } else {
        setShowContent([
          { button: false, list: false },
          { button: false, list: true },
        ]);
        setDirectionDestination(null);
        setRouteInfo(null);
      }
    }
  }

  // TODO: Smoothe transitions with mapRef
  // TODO: ClusterMap for images
  // TODO: Add all Images
  // TODO: onLongPress => Start custom Route (maybe also implement this in the other map Screens)
  // TODO: bei MapLocationElement => Icon für Routenplanung bzw. zur Route hinzufügen

  return (
    <View style={styles.root}>
      {showSettings && (
        <MapSettings
          onClose={() => setShowSettings(false)}
          toggleShowPastLocations={() =>
            setShowPastLocations((prevValue) => !prevValue)
          }
          showPastLocations={showPastLocations}
          toggleShowAllPlaces={() =>
            setShowAllPlaces((prevValue) => !prevValue)
          }
          showAllPlaces={showAllPlaces}
          mode={directionsMode}
          setMode={handleChangeDirectionsMode}
          setMapType={setMapType}
          mapType={mapType}
        />
      )}
      {popupText && (
        <Popup
          content={popupText}
          onClose={handleClosePopup}
          colorScheme={ColorScheme.accent}
        />
      )}
      <MapScopeSelector
        onChangeMapScope={handleChangeMapScope}
        journey={journey!}
        value={mapScope}
      />
      <MapLocationList
        locations={shownLocations || []}
        mapScope={mapScope.name}
        mode={directionsMode}
        onPress={handlePressListElement}
        toggleButtonVisibility={() => handleHideButtons('locationList')}
        showContent={showContent[0]}
      />
      <RoutePlanner
        locations={shownLocations || []}
        mapScope={mapScope}
        mode={directionsMode}
        toggleButtonVisibility={() => handleHideButtons('routePlanner')}
        showContent={showContent[1]}
        setRoutePoints={setRoutePoints}
      />
      <MapView
        style={styles.map}
        initialRegion={
          region ?? {
            latitude: 20,
            longitude: 0,
            latitudeDelta: 80,
            longitudeDelta: 80, // Fallback
          }
        }
        {...(region ? { region } : {})}
        onPress={() => {}}
        mapType={mapType}
        userInterfaceStyle='light'
        customMapStyle={lightMapStyle}
      >
        {directionDestination && (
          <MapViewDirections
            apikey={GOOGLE_API_KEY}
            origin={userCtx.currentLocation}
            destination={directionDestination}
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
            onError={() => setPopupText('No route found...')}
            onReady={(result) => {
              setRouteInfo({
                distance: result.distance, // in kilometers
                duration: result.duration, // in minutes
              });
            }}
          />
        )}
        {shownLocations.map((location) => {
          const isActive = pressedLocation && location === pressedLocation;
          return (
            <MapsMarker
              key={generateRandomString()}
              location={location}
              active={isActive}
              onPressMarker={setPressedLocation.bind(location)}
            />
          );
        })}
      </MapView>
      {pressedLocation && (
        <MapLocationElement
          location={pressedLocation}
          onClose={handleCloseMapLocationElement}
        />
      )}
      {routeInfo && (
        <Pressable
          onPress={() => setRouteInfo(null)}
          style={styles.routeInfoContainer}
        >
          <Text style={styles.routeInfoText}>
            Distance: {routeInfo.distance.toFixed(1)} km | Time:{' '}
            {formatRouteDuration(routeInfo.duration)}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    top: '90%',
    left: '80%',
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  routeInfoText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Map;
