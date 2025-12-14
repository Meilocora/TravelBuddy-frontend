import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import Constants from 'expo-constants';
import MapView, {
  LatLng,
  LongPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import MapViewDirections, {
  MapViewDirectionsMode,
} from 'react-native-maps-directions';
import ClusteredMapView from 'react-native-map-clustering';

import {
  ColorScheme,
  Icons,
  ImageLocation,
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
  formatImageToLocation,
  getMapLocationsFromJourney,
  getMapLocationsFromMajorStage,
  getMapLocationsFromMinorStage,
  getRegionForLocations,
  getRemainingCountriesPlacesLocations,
} from '../../utils/location';
import MapLocationList from '../../components/Maps/MapLocationList/MapLocationList';
import { StagesContext } from '../../store/stages-context';
import MapLocationElement from '../../components/Maps/MapLocationElement/MapLocationElement';
import RoutePlanner from '../../components/Maps/RoutePlanner/RoutePlanner';
import { UserContext } from '../../store/user-context';
import { formatRouteDuration, generateRandomString } from '../../utils';
import IconButton from '../../components/UI/IconButton';
import MapSettings from '../../components/Maps/MapSettings';
import { CustomCountryContext } from '../../store/custom-country-context';
import { GlobalStyles, lightMapStyle } from '../../constants/styles';
import { usePersistedState } from '../../hooks/usePersistedState';
import { ImageContext } from '../../store/image-context';
import RouteInfo, { RouteInfoType } from '../../components/Maps/RouteInfo';
import ImageModal from '../../components/UI/ImageModal';
import { Image as ImageType } from '../../models/media';
import OpenRouteInGoogleMapsButton from '../../components/Maps/OpenRouteInGoogleMapsButton';
import ImageMarker from '../../components/Maps/ImageMarker';
import { DELTA, EDGE_PADDING } from '../../constants/maps';

interface MapProps {
  navigation: NativeStackNavigationProp<JourneyBottomTabsParamsList, 'Map'>;
  route: RouteProp<JourneyBottomTabsParamsList, 'Map'>;
}

const Map: React.FC<MapProps> = ({ navigation, route }): ReactElement => {
  const imageCtx = useContext(ImageContext);
  const userCtx = useContext(UserContext);
  const stagesCtx = useContext(StagesContext);
  const customCountryCtx = useContext(CustomCountryContext);

  const mapRef = useRef<MapView>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showPastLocations, setShowPastLocations] = usePersistedState(
    'map_show_past_locations',
    false
  );
  const [showAllPlaces, setShowAllPlaces] = usePersistedState(
    'map_show_all_places',
    false
  );
  const [showImages, setShowImages] = useState(false);
  const [directionsMode, setDirectionsMode] =
    usePersistedState<MapViewDirectionsMode>('map_directions_mode', 'DRIVING');

  const [mapType, setMapType] = usePersistedState<MapType>(
    'map_type',
    'standard'
  );
  const [region, setRegion] = useState<Region | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfoType | null>(null);
  const [pressedLocation, setPressedLocation] = useState<
    Location | undefined
  >();

  const [routePoints, setRoutePoints] = useState<LatLng[] | undefined>();
  const [showImageModal, setShowImageModal] = useState<ImageType | undefined>();

  const [showContent, setShowContent] = useState([
    { button: true, list: false },
    { button: true, list: false },
  ]);

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;

  const journeyId = stagesCtx.selectedJourneyId!;
  const journey = stagesCtx.findJourney(journeyId);

  const stagesNavigation = useNavigation<NavigationProp<StackParamList>>();

  const minorStage = route.params?.minorStage;
  const majorStage = route.params?.majorStage;

  // get all images that are connected to the shown stage
  let minorStageIds: number[] = [];
  if (minorStage) {
    minorStageIds.push(minorStage.id);
  } else if (majorStage) {
    if (majorStage.minorStages) {
      for (const minorStage of majorStage.minorStages) {
        minorStageIds.push(minorStage.id);
      }
    }
  } else {
    if (journey?.majorStages) {
      for (const majorStage of journey.majorStages) {
        if (majorStage.minorStages) {
          for (const minorStage of majorStage.minorStages) {
            minorStageIds.push(minorStage.id);
          }
        }
      }
    }
  }

  let imageLocations: ImageLocation[] = [];
  if (showImages) {
    for (const img of imageCtx.images) {
      if (img.minorStageId && img.minorStageId in minorStageIds) {
        const imgLoc = formatImageToLocation(img);
        imgLoc && imageLocations.push(imgLoc);
      }
    }
  }

  // 1) Derive mapScope from RouteParams
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

  // 2) Change mapScope via RouteParams
  const handleChangeMapScope = useCallback(
    (next: StageData) => {
      // UI-/Routing-Zustände zurücksetzen
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

  // 3) get Locations, thath belong to the Major- or MinorStage depending on RouteParam
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

  // 4) get IDs of all involved countries
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

  // 5) get all Locations, that are linked to the countries
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

  // 6) give baseLocations a color and concat with countries locations
  const shownLocations = useMemo(() => {
    return addColor(baseLocations || [], mapScope.stageType).concat(
      countryLocations
    );
  }, [baseLocations, countryLocations, mapScope.stageType]);

  // 7) Calculate initial region
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
  }, [baseLocations]);

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
    setPressedLocation(location);
  }

  const handleChangeDirectionsMode = useCallback(
    (m: MapViewDirectionsMode) => setDirectionsMode(m),
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
        setRouteInfo(null);
      }
    }
  }

  const fitToItems = useCallback((pts: LatLng[]) => {
    if (!mapRef.current || pts.length === 0) return;

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
  }, []);

  const coords: LatLng[] = useMemo(
    () =>
      baseLocations
        ? baseLocations
            .filter(
              (l) =>
                l.locationType !== 'transportation_departure' &&
                l.locationType !== 'transportation_arrival'
            )
            .map((l) => ({
              latitude: l.data.latitude,
              longitude: l.data.longitude,
            }))
        : shownLocations
            .filter(
              (l) =>
                l.locationType !== 'transportation_departure' &&
                l.locationType !== 'transportation_arrival'
            )
            .map((l) => ({
              latitude: l.data.latitude,
              longitude: l.data.longitude,
            })),
    [baseLocations, shownLocations]
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
    }

    if (allCoords.length === 0) return;

    fitToItems(allCoords);
  }, [coords, routePoints, fitToItems]);

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
    fitToItems(coords);
  }

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
    <View style={styles.root}>
      <ImageModal
        image={showImageModal}
        onClose={() => setShowImageModal(undefined)}
        visible={typeof showImageModal !== 'undefined'}
        onCalcRoute={(localCoords: LatLng) => setRoutePoints([localCoords])}
      />
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
          toggleShowImages={() => setShowImages((prevValue) => !prevValue)}
          showImages={showImages}
        />
      )}
      <MapScopeSelector
        onChangeMapScope={handleChangeMapScope}
        journey={journey!}
        value={mapScope}
        mapType={mapType}
      />
      <MapLocationList
        locations={shownLocations || []}
        mapScope={mapScope.name}
        mode={directionsMode}
        onPress={handlePressListElement}
        toggleButtonVisibility={() => handleHideButtons('locationList')}
        showContent={showContent[0]}
        mapType={mapType}
      />
      <RoutePlanner
        locations={shownLocations || []}
        mapScope={mapScope}
        mode={directionsMode}
        toggleButtonVisibility={() => handleHideButtons('routePlanner')}
        showContent={showContent[1]}
        setRoutePoints={setRoutePoints}
        mapType={mapType}
      />
      {region && (
        <ClusteredMapView
          ref={mapRef}
          initialRegion={
            region || {
              latitude: userCtx.currentLocation?.latitude || 0,
              longitude: userCtx.currentLocation?.longitude || 0,
              latitudeDelta: DELTA,
              longitudeDelta: DELTA,
            }
          }
          onLongPress={handleLongPress}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
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
          {shownLocations.map((location) => {
            const isActive = pressedLocation && location === pressedLocation;
            return (
              <MapsMarker
                key={generateRandomString()}
                location={location}
                active={isActive}
                onPressMarker={handlePressMarker}
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
      )}
      {routeInfo?.display && (
        <RouteInfo
          onClose={() => setRouteInfo(null)}
          onDeleteRoute={handleDeleteRoute}
          routeInfo={routeInfo}
          topDistance={55}
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
  root: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: '90%',
    left: '80%',
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

export default Map;
