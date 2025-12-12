import { ReactElement, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';
import { MapViewDirectionsMode } from 'react-native-maps-directions';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { LatLng } from 'react-native-maps';

import IconButton from '../../UI/IconButton';
import { ColorScheme, Icons, Location, MapType } from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import RoutePlannerList from './RoutePlannerList';
import Button from '../../UI/Button';
import { StageData } from '../MapScopeSelector';
import {
  compareRouteLocations,
  getRouteLocationsNamesFromLocations,
} from '../../../utils/location';

interface RoutePlannerProps {
  locations: Location[];
  mapScope: StageData;
  mode: MapViewDirectionsMode;
  toggleButtonVisibility: () => void;
  showContent: { button: boolean; list: boolean };
  setRoutePoints: (coordinates: LatLng[] | undefined) => void;
  mapType: MapType;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({
  locations,
  mapScope,
  mode,
  toggleButtonVisibility,
  showContent,
  setRoutePoints,
  mapType,
}): ReactElement => {
  const [routeLocations, setRouteLocations] = useState<string[]>([]);
  const [plannedButtonVisible, setPlannedButtonVisible] = useState(true);

  const isFocused = useIsFocused();

  useFocusEffect(() => {
    if (!isFocused) {
      setRouteLocations([]); // Reset only when the screen loses focus
    }
  });

  useEffect(() => {
    setRouteLocations([]);
  }, [mapScope]);

  function handleAddElement(loc: string, index: number) {
    if (routeLocations.length === 1 && index === 1) {
      return setRouteLocations((prevValues) => [...prevValues, loc]);
    } else if (index === 99) {
      return setRouteLocations((prevValues) => [
        ...prevValues.slice(0, -1),
        loc,
        prevValues[prevValues.length - 1],
      ]);
    }
    setRouteLocations((prevValues) => [
      ...prevValues.slice(0, index!),
      loc,
      ...prevValues.slice(index! + 1),
    ]);
  }

  function handleRemoveElement(loc: string) {
    setRouteLocations((prevValues) =>
      prevValues.filter((item) => item !== loc)
    );
  }

  function handleSwitchElements(locs: string[]) {
    setRouteLocations(locs);
  }

  function handlePressPlannedRoute() {
    const customLocations = getRouteLocationsNamesFromLocations(locations);

    // Limit to 25 locations maximum (Google Maps API constraint)
    const limitedLocations = customLocations.slice(0, 25);

    setRouteLocations(limitedLocations);
    setPlannedButtonVisible(false);
  }

  useEffect(() => {
    const points = routeLocations
      .map((name) => locations.find((loc) => loc.data.name === name))
      .filter((loc): loc is Location => !!loc) // filter out undefined
      .map((loc) => ({
        latitude: loc.data.latitude,
        longitude: loc.data.longitude,
      }));
    setRoutePoints(points);

    const routeAsPlanned = compareRouteLocations(
      routeLocations,
      getRouteLocationsNamesFromLocations(locations)
    );
    if (!routeAsPlanned) {
      setPlannedButtonVisible(true);
    }
  }, [routeLocations, locations, setRoutePoints, showContent.list]);

  return (
    <>
      {showContent.button && (
        <Animated.View
          style={styles.buttonContainer}
          entering={SlideInLeft}
          exiting={SlideOutLeft}
        >
          <IconButton
            icon={Icons.routePlanner}
            onPress={toggleButtonVisibility}
            color={
              mapType === 'standard'
                ? GlobalStyles.colors.grayDark
                : GlobalStyles.colors.graySoft
            }
            size={36}
            style={{ marginLeft: 6 }}
          />
        </Animated.View>
      )}
      {showContent.list && (
        <Animated.View
          entering={SlideInLeft}
          exiting={SlideOutLeft}
          style={styles.container}
        >
          <OutsidePressHandler
            onOutsidePress={toggleButtonVisibility}
            style={styles.innerContainer}
          >
            <RoutePlannerList
              locations={locations}
              routeElements={routeLocations}
              onAddElement={handleAddElement}
              onRemoveElement={handleRemoveElement}
              onSwitchElements={handleSwitchElements}
            />
            {plannedButtonVisible && mapScope.name !== 'MinorStage' && (
              <Button
                style={styles.routeButton}
                textStyle={styles.routeButtonText}
                colorScheme={ColorScheme.neutral}
                onPress={handlePressPlannedRoute}
              >
                Planned Route
              </Button>
            )}
          </OutsidePressHandler>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    position: 'absolute',
    zIndex: 4,
    justifyContent: 'center',
  },
  innerContainer: {
    maxHeight: Dimensions.get('window').height * 0.9,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'black',
    borderWidth: 1,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  buttonContainer: {
    flex: 1,
    position: 'absolute',
    top: '50%',
    zIndex: 1,
  },
  routeButton: {
    marginHorizontal: 'auto',
    marginTop: 12,
  },
  routeButtonText: {
    fontSize: 14,
  },
});

export default RoutePlanner;
