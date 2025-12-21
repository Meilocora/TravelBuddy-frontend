import { ReactElement, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import MapLocationListElement from './MapLocationListElement';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';
import { MapViewDirectionsMode } from 'react-native-maps-directions';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import IconButton from '../../UI/IconButton';
import {
  FilterKey,
  Icons,
  Location,
  LocationType,
  MapType,
} from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import ActivityIcon from '../../../../assets/activity.svg';
import AccommodationIcon from '../../../../assets/accommodation.svg';
import PlaceToVisitIcon from '../../../../assets/placeToVisit.svg';
import PlaneIcon from '../../../../assets/plane_clean.svg';

const heigth = 20;
const width = 20;

interface MapLocationListProps {
  locations: Location[];
  mapScope: string;
  mode: MapViewDirectionsMode;
  toggleButtonVisibility: () => void;
  showContent: { button: boolean; list: boolean };
  onPress: (location: Location) => void;
  mapType: MapType;
}

const MapLocationList: React.FC<MapLocationListProps> = ({
  locations,
  mapScope,
  mode,
  toggleButtonVisibility,
  showContent,
  onPress,
  mapType,
}): ReactElement => {
  const [selectedLocation, setSelectedLocation] = useState<
    string | undefined
  >();

  const isFocused = useIsFocused();

  useFocusEffect(() => {
    if (!isFocused) {
      setSelectedLocation(undefined); // Reset only when the screen loses focus
    }
  });

  useEffect(() => {
    setSelectedLocation(undefined);
  }, [mapScope]);

  const uniqueLocations = locations.filter((location, index, self) => {
    return (
      self.findIndex((loc) => loc.data.name === location.data.name) === index
    );
  });

  function handlePressListElement(location: Location) {
    setSelectedLocation(location.data.name);
    onPress(location);
    toggleButtonVisibility();
  }

  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    activities: true,
    accommodations: true,
    places: true,
    transportations: true,
  });

  function handleChangeFilter(filter: FilterKey) {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  }

  let filteredLocations = uniqueLocations;
  if (!filters.activities) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.locationType !== LocationType.activity
    );
  }
  if (!filters.accommodations) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.locationType !== LocationType.accommodation
    );
  }
  if (!filters.places) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.locationType !== LocationType.placeToVisit
    );
  }
  if (!filters.transportations) {
    filteredLocations = filteredLocations.filter(
      (loc) => !loc.locationType.startsWith('transportation')
    );
  }

  return (
    <>
      {showContent.button && (
        <Animated.View
          style={styles.buttonContainer}
          entering={SlideInLeft}
          exiting={SlideOutLeft}
        >
          <IconButton
            icon={Icons.listCircleOutline}
            onPress={toggleButtonVisibility}
            color={
              mapType === 'standard'
                ? GlobalStyles.colors.grayDark
                : GlobalStyles.colors.graySoft
            }
            size={40}
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
            <View style={styles.iconsContainer}>
              <Pressable
                style={[
                  styles.iconContainer,
                  !filters.activities && styles.inactiveIconContainer,
                ]}
                onPress={() => handleChangeFilter('activities')}
              >
                <ActivityIcon
                  width={width}
                  height={heigth}
                  fill={GlobalStyles.colors.grayDark}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.iconContainer,
                  !filters.accommodations && styles.inactiveIconContainer,
                ]}
                onPress={() => handleChangeFilter('accommodations')}
              >
                <AccommodationIcon
                  width={width}
                  height={heigth}
                  fill={GlobalStyles.colors.grayDark}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.iconContainer,
                  !filters.places && styles.inactiveIconContainer,
                ]}
                onPress={() => handleChangeFilter('places')}
              >
                <PlaceToVisitIcon
                  width={width}
                  height={heigth}
                  fill={GlobalStyles.colors.grayDark}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.iconContainer,
                  !filters.transportations && styles.inactiveIconContainer,
                ]}
                onPress={() => handleChangeFilter('transportations')}
              >
                <PlaneIcon
                  width={width}
                  height={heigth}
                  fill={GlobalStyles.colors.grayDark}
                />
              </Pressable>
            </View>
            <ScrollView>
              {filteredLocations.map((location) => (
                <MapLocationListElement
                  key={location.data.latitude}
                  location={location}
                  onPress={handlePressListElement}
                  selected={selectedLocation === location.data.name}
                />
              ))}
            </ScrollView>
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
    height: Dimensions.get('window').height * 0.7,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'black',
    borderWidth: 1,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  iconsContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
    marginHorizontal: 'auto',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  inactiveIconContainer: {
    opacity: 0.4,
  },
  buttonContainer: {
    flex: 1,
    position: 'absolute',
    top: '40%',
    zIndex: 1,
  },
});

export default MapLocationList;
