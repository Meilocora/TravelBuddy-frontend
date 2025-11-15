import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
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
  MapScopeType,
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
import { formatRouteDuration } from '../../utils';
import IconButton from '../../components/UI/IconButton';
import MapSettings from '../../components/Maps/MapSettings';
import { CustomCountryContext } from '../../store/custom-country-context';
import { lightMapStyle } from '../../constants/styles';

interface MapProps {
  navigation: NativeStackNavigationProp<JourneyBottomTabsParamsList, 'Map'>;
  route: RouteProp<JourneyBottomTabsParamsList, 'Map'>;
}

const Map: React.FC<MapProps> = ({ navigation, route }): ReactElement => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPastLocations, setShowPastLocations] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [shownLocations, setShownLocations] = useState<Location[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [directionDestination, setDirectionDestination] =
    useState<LatLng | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [directionsMode, setDirectionsMode] =
    useState<MapViewDirectionsMode>('DRIVING');
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

  const minorStage = route.params?.minorStage;
  const majorStage = route.params?.majorStage;

  const [mapScope, setMapScope] = useState<StageData>({
    stageType: 'Journey',
    id: journeyId,
    name: journey!.name,
  });

  useEffect(() => {
    if (majorStage) {
      setMapScope({
        stageType: 'MajorStage',
        id: majorStage.id,
        name: majorStage.title,
      });
    } else if (minorStage) {
      setMapScope({
        stageType: 'MinorStage',
        id: minorStage.id,
        name: minorStage.title,
      });
    } else {
      setMapScope({
        stageType: 'Journey',
        id: journeyId,
        name: journey!.name,
      });
    }
  }, [journey, majorStage, minorStage]);

  useFocusEffect(
    useCallback(() => {
      // get data when the screen comes into focus
      async function getLocations() {
        let locations: Location[] | undefined;
        let countrylocs: Location[] | undefined;
        let mapScopeType: MapScopeType;

        // TODO: Wird auch neu berechnet, wenn nur showAllPlaces angepasst wird
        if (majorStage) {
          mapScopeType = 'MajorStage';
          // setMapScope({
          //   stageType: 'MajorStage',
          //   id: majorStage.id,
          //   name: majorStage.title,
          // });
        } else if (minorStage) {
          mapScopeType = 'MinorStage';
          // setMapScope({
          //   stageType: 'MinorStage',
          //   id: minorStage.id,
          //   name: minorStage.title,
          // });
        } else {
          mapScopeType = 'Journey';
          // setMapScope({
          //   stageType: 'Journey',
          //   id: journeyId,
          //   name: journey!.name,
          // });
        }

        if (minorStage) {
          const localMajorStage = stagesCtx.findMinorStagesMajorStage(
            minorStage.id
          );
          locations = getMapLocationsFromMinorStage(
            minorStage,
            localMajorStage!,
            showPastLocations
          );
          countrylocs = getRemainingCountriesPlacesLocations(
            [localMajorStage?.country.id!],
            locations,
            customCountryCtx.findCountriesPlaces,
            showAllPlaces
          );
        } else if (majorStage) {
          locations = getMapLocationsFromMajorStage(
            majorStage,
            showPastLocations
          );
          countrylocs = getRemainingCountriesPlacesLocations(
            [majorStage?.country.id!],
            locations,
            customCountryCtx.findCountriesPlaces,
            showAllPlaces
          );
        } else {
          locations = getMapLocationsFromJourney(journey!, showPastLocations);
          const countryIds: number[] = [];
          if (!journey?.countries) {
            countrylocs = undefined;
          } else {
            for (const country of journey?.countries) {
              countryIds.push(country.id);
            }
          }
          countrylocs = getRemainingCountriesPlacesLocations(
            countryIds,
            locations,
            customCountryCtx.findCountriesPlaces,
            showAllPlaces
          );
        }

        if (locations) {
          setLocations(locations);
          let coloredLocations = addColor(locations, mapScopeType);
          coloredLocations = coloredLocations.concat(countrylocs);
          setShownLocations(coloredLocations);
          // Filter locations that could be way off to calculate an accurate region for the MapView
          const relevantLocations = locations.filter(
            (location) =>
              location.locationType !== 'transportation_departure' &&
              location.locationType !== 'transportation_arrival'
          );
          setRegion(await getRegionForLocations(relevantLocations));
        }
      }

      getLocations();

      return () => {
        // Cleanup function to reset all states when the screen goes out of focus
        setLocations([]);
        setShownLocations([]);
        setPressedLocation(undefined);
      };
    }, [journeyId, minorStage, majorStage, showAllPlaces, showPastLocations])
  );

  const stagesNavigation = useNavigation<NavigationProp<StackParamList>>();

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

  function handleChangeDirectionsMode(mode: MapViewDirectionsMode) {
    setDirectionsMode(mode);
  }

  function handleClosePopup() {
    setPopupText(undefined);
  }

  function handleCloseMapLocationElement() {
    setPressedLocation(undefined);
  }

  async function handleChangeMapScope(mapScope: StageData) {
    setMapScope(mapScope);
    setDirectionDestination(null);
    setPressedLocation(undefined);
    setRoutePoints(undefined);
    setRouteInfo(null);

    let filteredLocations: Location[] | undefined;
    let countrylocs: Location[] | undefined;

    if (mapScope.stageType === 'MinorStage') {
      const minorStage = stagesCtx.findMinorStage(mapScope.id);
      const majorStage = stagesCtx.findMinorStagesMajorStage(mapScope.id);
      filteredLocations = getMapLocationsFromMinorStage(
        minorStage!,
        majorStage!,
        showPastLocations
      );
      countrylocs = getRemainingCountriesPlacesLocations(
        [majorStage?.country.id!],
        locations,
        customCountryCtx.findCountriesPlaces,
        showAllPlaces
      );
    } else if (mapScope.stageType === 'MajorStage') {
      const majorStage = stagesCtx.findMajorStage(mapScope.id);
      filteredLocations = getMapLocationsFromMajorStage(
        majorStage!,
        showPastLocations
      );
      countrylocs = getRemainingCountriesPlacesLocations(
        [majorStage?.country.id!],
        locations,
        customCountryCtx.findCountriesPlaces,
        showAllPlaces
      );
    } else {
      filteredLocations = locations;
      const countryIds: number[] = [];
      if (!journey?.countries) {
        countrylocs = undefined;
      } else {
        for (const country of journey?.countries) {
          countryIds.push(country.id);
        }
      }
      countrylocs = getRemainingCountriesPlacesLocations(
        countryIds,
        locations,
        customCountryCtx.findCountriesPlaces,
        showAllPlaces
      );
    }
    if (!filteredLocations) {
      return;
    }
    // Filter locations that could be way off to calculate an accurate region for the MapView
    const relevantLocations = filteredLocations.filter(
      (location) =>
        location.locationType !== 'transportation_departure' &&
        location.locationType !== 'transportation_arrival'
    );

    let coloredLocations = addColor(filteredLocations, mapScope.stageType);
    coloredLocations = coloredLocations.concat(countrylocs);
    setShownLocations(coloredLocations);

    return setRegion(await getRegionForLocations(relevantLocations));
  }

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
        locations={shownLocations}
        mapScope={mapScope.name}
        mode={directionsMode}
        setMode={handleChangeDirectionsMode}
        onPress={handlePressListElement}
        toggleButtonVisibility={() => handleHideButtons('locationList')}
        showContent={showContent[0]}
      />
      <RoutePlanner
        locations={shownLocations}
        mapScope={mapScope}
        mode={directionsMode}
        setMode={handleChangeDirectionsMode}
        toggleButtonVisibility={() => handleHideButtons('routePlanner')}
        showContent={showContent[1]}
        setRoutePoints={setRoutePoints}
      />
      <MapView
        style={styles.map}
        initialRegion={region!}
        region={region!}
        onPress={() => {}}
        mapType='standard'
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
              key={location.belonging + location.data.name + location.id}
              location={location}
              active={isActive}
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
