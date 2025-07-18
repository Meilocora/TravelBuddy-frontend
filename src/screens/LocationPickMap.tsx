import 'react-native-get-random-values';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { RouteProp } from '@react-navigation/native';
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  PoiClickEvent,
  Region,
} from 'react-native-maps';
import GooglePlacesTextInput from 'react-native-google-places-textinput';

import { ColorScheme, PlaceToVisit, StackParamList } from '../models';
import Modal from '../components/UI/Modal';
import { GlobalStyles } from '../constants/styles';
import Button from '../components/UI/Button';
import {
  formatPlaceToLocation,
  getPlaceDetails,
  getRegionForLocations,
} from '../utils/location';
import { CustomCountryContext } from '../store/custom-country-context';
import MapsMarker from '../components/Maps/MapsMarker';
import { generateRandomString } from '../utils';
import HeaderTitle from '../components/UI/HeaderTitle';
import { StagesContext } from '../store/stages-context';

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
  const initialLocation = route.params && {
    lat: route.params.initialLat,
    lng: route.params.initialLng,
  };
  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    process.env.REACT_APP_GOOGLE_API_KEY;

  const initialColorScheme = route.params.colorScheme || ColorScheme.primary;

  const minorStageId = route.params.minorStageId;
  const customCountryId = route.params.customCountryId || undefined;

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLocation, setHasLocation] = useState(route.params.hasLocation);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation.lat,
    longitude: initialLocation.lng,
    latitudeDelta: 0.1,
    longitudeDelta: 0.04,
  });
  const [title, setTitle] = useState<string | undefined>(
    route.params.initialTitle
  );
  const [showModal, setShowModal] = useState(false);

  let placesToVisit: undefined | PlaceToVisit[];
  if (customCountryId) {
    placesToVisit = customCountryCtx.findCountriesPlaces(customCountryId);

    if (minorStageId) {
      const assignedPlaces = stagesCtx.findAssignedPlaces(
        customCountryId,
        minorStageId
      );

      // Filter out places that are already assigned to any minorStage
      if (placesToVisit && assignedPlaces) {
        placesToVisit = placesToVisit.filter(
          (place) =>
            !assignedPlaces.some((assigned) => assigned.name === place.name)
        );
      }
    }
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

  function selectLocationHandler(event: MapPressEvent) {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.1,
      longitudeDelta: 0.04,
    });
    setHasLocation(true);
    setIsInitialLoad(false); // Prevent future auto-calculations
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
    setTitle(name.substring(0, 20));
    setHasLocation(true);
    setIsInitialLoad(false); // Prevent future auto-calculations
    setShowModal(true);
  }

  async function handleSearchResult(place: any) {
    if (place) {
      const latLng: LatLng = await getPlaceDetails(place);
      setRegion({
        latitude: latLng.latitude,
        longitude: latLng.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.04,
      });
      setTitle(place.structuredFormat.mainText.text.substring(0, 20));
      setHasLocation(true);
      setIsInitialLoad(false); // Prevent future auto-calculations
      setShowModal(true);
    }
    return;
  }

  function handleSelectPlace() {
    route.params.onPickLocation({
      title: title,
      lat: region.latitude,
      lng: region.longitude,
    });
    navigation.goBack();
  }

  function handleResetPlace() {
    if (route.params.onResetLocation) {
      route.params.onResetLocation();
      navigation.goBack();
    }
  }

  function handlePressMarker(name: string) {
    if (route.params.onPressMarker) {
      route.params.onPressMarker(name);
    }
  }

  let mainColor = GlobalStyles.colors.primary700;
  if (initialColorScheme === ColorScheme.complementary) {
    mainColor = GlobalStyles.colors.complementary700;
  } else if (initialColorScheme === ColorScheme.accent) {
    mainColor = GlobalStyles.colors.accent700;
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={'Pick a Location'} />,
      headerStyle: { backgroundColor: mainColor },
    });
  }, []);

  return (
    <View style={styles.container}>
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
        initialRegion={region!}
        region={region}
        onPress={route.params.onPressMarker ? undefined : selectLocationHandler}
        onPoiClick={handlePoiClick}
        style={styles.map}
      >
        {initialLocation && hasLocation && !minorStageId && (
          <Marker
            title={title}
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
          />
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
      </MapView>
      {route.params.onResetLocation && (
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
    width: '75%',
    alignSelf: 'center',
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fff',
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
