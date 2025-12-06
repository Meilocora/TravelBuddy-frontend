import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Region } from 'react-native-maps';
import OutsidePressHandler from 'react-native-outside-press';

import { generateRandomString } from '../../../utils';
import InfoText from '../../UI/InfoText';
import { GlobalStyles } from '../../../constants/styles';
import ListItem from '../../UI/search/ListItem';
import Button from '../../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  Icons,
  MapLocation,
  PlaceToVisit,
  StackParamList,
} from '../../../models';
import { FetchPlacesProps } from '../../../utils/http';
import IconButton from '../../UI/IconButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomCountryContext } from '../../../store/custom-country-context';
import {
  formatPlaceToLocation,
  getRegionForLocations,
} from '../../../utils/location';
import { Location } from '../../../models';
import { StagesContext } from '../../../store/stages-context';

interface PlacesSelectionProps {
  onFetchRequest: (countryName: string) => Promise<FetchPlacesProps>;
  onAddHandler: (placeId: number) => void;
  onRemoveHandler: (placeId: number) => void;
  onCloseModal: () => void;
  chosenPlaces: string[];
  countryName: string;
  minorStageId: number;
}

const PlacesSelection = ({
  onFetchRequest,
  onAddHandler,
  onRemoveHandler,
  onCloseModal,
  chosenPlaces,
  countryName,
  minorStageId,
}: PlacesSelectionProps): ReactElement => {
  const navigation = useNavigation<NavigationProp<StackParamList>>();
  const [fetchedData, setFetchedData] = useState<PlaceToVisit[]>([]);
  const [customCountryId, setCustomCountryId] = useState<number | null>(null);
  const [averageRegion, setAverageRegion] = useState<Region>();

  const stagesCtx = useContext(StagesContext);
  const customCountryCtx = useContext(CustomCountryContext);
  const country = customCountryCtx.customCountries.find(
    (country) => country.name === countryName
  );

  let placeLocations: Location[] = [];
  if (country?.placesToVisit) {
    for (const place of country.placesToVisit) {
      placeLocations.push(formatPlaceToLocation(place));
    }
  }

  const minorStage = stagesCtx.findMinorStage(minorStageId);

  useEffect(() => {
    async function getAverageRegion() {
      const response: Region = await getRegionForLocations(placeLocations);
      setAverageRegion(response);
    }
    getAverageRegion();
  }, [countryName]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const { places, countryId } = await onFetchRequest(countryName);

      setCustomCountryId(countryId!);

      if (places) {
        // const names = places.map((item) => item.name);
        const placesNotChosen = places.filter(
          (place) => !chosenPlaces.includes(place.name)
        );
        setFetchedData(placesNotChosen);
      }
    }

    fetchData();
  }, [chosenPlaces]);

  // Timer to close Selection after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseModal();
    }, 10000);

    return () => clearTimeout(timer); // Clear the timer if component unmounts or fetchedData changes
  }, [fetchedData, onCloseModal]);

  function handlePressListElement(place: PlaceToVisit) {
    onAddHandler(place.id);
  }

  function handlePressMarker(location: Location) {
    const partOfStage = minorStage!.placesToVisit?.some(
      (p) => p.name === location.data.name
    );
    if (partOfStage) {
      onRemoveHandler(location.placeId!);
    } else {
      onAddHandler(location.placeId!);
    }
  }

  function handlePressAdd() {
    navigation.navigate('ManagePlaceToVisit', {
      placeId: null,
      countryId: customCountryId,
    });
  }

  function handlePressMapButton() {
    if (averageRegion) {
      navigation.navigate('LocationPickMap', {
        initialTitle: '',
        initialLat: averageRegion.latitude,
        initialLng: averageRegion.longitude,
        onPickLocation: (location: MapLocation) => {},
        onAddLocation: (location: Location) => {
          handlePressMarker(location);
        },
        hasLocation: true,
        colorScheme: ColorScheme.complementary,
        customCountryIds: [country!.id],
        minorStageId: minorStageId,
      });
    }
  }

  let content: ReactElement | null = null;

  if (fetchedData.length > 0) {
    content = (
      <>
        <View style={styles.mapButtonContainer}>
          <IconButton
            icon={Icons.map}
            onPress={handlePressMapButton}
            color={GlobalStyles.colors.graySoft}
            containerStyle={styles.mapButton}
          />
          <Text style={styles.mapText}>Pick on map!</Text>
        </View>
        <ScrollView style={styles.list}>
          {fetchedData.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handlePressListElement(item)}
              style={({ pressed }) => [
                styles.listElementContainer,
                ,
                pressed && styles.pressed,
              ]}
              android_ripple={{ color: GlobalStyles.colors.grayMedium }}
            >
              <Text style={[styles.listElementText]} numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Button
          colorScheme={ColorScheme.neutral}
          mode={ButtonMode.flat}
          onPress={onCloseModal}
          style={styles.button}
        >
          Dismiss
        </Button>
      </>
    );
  } else {
    content = (
      <>
        <View style={styles.mapButtonContainer}></View>
        <IconButton
          icon={Icons.map}
          onPress={handlePressMapButton}
          color={GlobalStyles.colors.graySoft}
          containerStyle={styles.mapButton}
        />
        <InfoText content='No items found...' style={styles.info} />
        <View style={{ flexDirection: 'row' }}>
          <Button
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
            onPress={onCloseModal}
            style={styles.button}
          >
            Dismiss
          </Button>
          <Button
            colorScheme={ColorScheme.complementary}
            onPress={handlePressAdd}
            style={styles.button}
          >
            Add Place!
          </Button>
        </View>
      </>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <OutsidePressHandler
        onOutsidePress={onCloseModal}
        style={{ width: '100%', height: '100%' }}
      >
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutUp}
          style={styles.outerContainer}
        >
          <Pressable onPress={onCloseModal} style={styles.pressable}>
            {content}
          </Pressable>
        </Animated.View>
      </OutsidePressHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '85%',
    height: '100%',
    top: 150,
    left: '7.5%',
    position: 'absolute',
  },
  innerContainer: {
    marginVertical: 'auto',
    marginHorizontal: 'auto',
  },
  mapButtonContainer: { marginVertical: 5 },
  mapButton: {
    backgroundColor: GlobalStyles.colors.grayDark,
    alignSelf: 'center',
  },
  mapText: {
    color: GlobalStyles.colors.grayMedium,
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
  },
  pressable: {
    paddingVertical: 5,
    backgroundColor: GlobalStyles.colors.purpleSoft,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.grayMedium,
    borderRadius: 10,
    zIndex: 2,
    elevation: 5,
  },
  list: {
    marginHorizontal: 10,
    paddingHorizontal: 4,
    height: 'auto',
    maxHeight: 300,
    maxWidth: 290,
  },
  info: {
    marginVertical: 4,
    marginTop: 4,
  },
  button: {
    marginVertical: 8,
    marginHorizontal: 'auto',
    alignSelf: 'center',
  },
  listElementContainer: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.grayDark,
    marginVertical: 5,
  },
  pressed: {
    opacity: 0.5,
  },
  listElementText: {
    fontSize: 20,
    color: GlobalStyles.colors.grayDark,
    flexWrap: 'wrap',
  },
});

export default PlacesSelection;
