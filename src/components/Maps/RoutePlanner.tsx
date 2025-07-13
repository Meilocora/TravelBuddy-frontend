import { ReactElement, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';
import { MapViewDirectionsMode } from 'react-native-maps-directions';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { LatLng } from 'react-native-maps';

import IconButton from '../UI/IconButton';
import { Icons, Location } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import RoutePlannerList from './RoutePlannerList';

interface RoutePlannerProps {
  locations: Location[];
  mapScope: string;
  mode: MapViewDirectionsMode;
  toggleButtonVisibility: () => void;
  showContent: { button: boolean; list: boolean };
  setMode: (mode: MapViewDirectionsMode) => void;
  setRoutePoints: (coordinates: LatLng[] | undefined) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({
  locations,
  mapScope,
  mode,
  toggleButtonVisibility,
  showContent,
  setMode,
  setRoutePoints,
}): ReactElement => {
  const [routeLocations, setRouteLocations] = useState<string[]>([]);

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

  useEffect(() => {
    const points = routeLocations
      .map((name) => locations.find((loc) => loc.data.name === name))
      .filter((loc): loc is Location => !!loc) // filter out undefined
      .map((loc) => ({
        latitude: loc.data.latitude,
        longitude: loc.data.longitude,
      }));
    setRoutePoints(points);
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
            color='black'
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
            <View style={styles.buttonRow}>
              <IconButton
                icon={Icons.walk}
                onPress={() => setMode('WALKING')}
                color='black'
                containerStyle={
                  mode === 'WALKING' ? styles.activeButton : styles.button
                }
              />
              <IconButton
                icon={Icons.bicycle}
                onPress={() => setMode('BICYCLING')}
                color='black'
                containerStyle={
                  mode === 'BICYCLING' ? styles.activeButton : styles.button
                }
              />
              <IconButton
                icon={Icons.car}
                onPress={() => setMode('DRIVING')}
                color='black'
                containerStyle={
                  mode === 'DRIVING' ? styles.activeButton : styles.button
                }
              />
            </View>
            <RoutePlannerList
              locations={locations}
              routeElements={routeLocations}
              onAddElement={handleAddElement}
              onRemoveElement={handleRemoveElement}
              onSwitchElements={handleSwitchElements}
            />
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
    zIndex: 2,
    justifyContent: 'center',
  },
  innerContainer: {
    maxHeight: Dimensions.get('window').height * 0.7,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 5,
    marginHorizontal: 'auto',
  },
  button: {
    padding: 2,
    borderWidth: 1,
    borderRadius: '100%',
    borderColor: 'black',
  },
  activeButton: {
    padding: 2,
    borderWidth: 1,
    borderRadius: '100%',
    borderColor: 'black',
    backgroundColor: GlobalStyles.colors.accent100,
  },
  buttonText: {
    color: 'black',
  },
});

export default RoutePlanner;
