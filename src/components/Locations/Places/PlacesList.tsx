import { ReactElement, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  FadeInDown,
  FadeOutDown,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import PlacesListItem from './PlacesListItem';
import { generateRandomString } from '../../../utils';
import Button from '../../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  Icons,
  PlaceToVisit,
  StackParamList,
} from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { PlaceContext } from '../../../store/place-context';
import InfoText from '../../UI/InfoText';
import IconButton from '../../UI/IconButton';

interface PlacesListProps {
  onCancel: () => void;
  countryId: number;
}

const PlacesList: React.FC<PlacesListProps> = ({
  onCancel,
  countryId,
}): ReactElement => {
  const placesCtx = useContext(PlaceContext);
  const navigation = useNavigation<NavigationProp<StackParamList>>();

  const [isFetching, setIsFetching] = useState(true);
  const [countryPlaces, setCountryPlaces] = useState<PlaceToVisit[]>([]);

  // Fetch all places to visit for this country
  useEffect(() => {
    function getPlaces() {
      const fetchedPlaces = placesCtx.getPlacesByCountry(countryId);
      setCountryPlaces(fetchedPlaces);
      setIsFetching(false);
    }

    getPlaces();
  }, [countryId, placesCtx.placesToVisit]);

  function handleAdd() {
    navigation.navigate('ManagePlaceToVisit', {
      placeId: null,
      countryId: countryId,
    });
  }

  function handleToggleFavorite(placeId: number) {
    setCountryPlaces((prevPlaces) => {
      return prevPlaces.map((place) => {
        if (place.id === placeId) {
          return { ...place, favorite: !place.favorite };
        }
        return place;
      });
    });
  }

  function handleToggleVisited(placeId: number) {
    setCountryPlaces((prevPlaces) => {
      return prevPlaces.map((place) => {
        if (place.id === placeId) {
          return { ...place, visited: !place.visited };
        }
        return place;
      });
    });
  }

  function handleShowOnMap() {
    navigation.navigate('ShowMap', {
      customCountryId: countryId,
    });
  }

  return (
    // TODO: Use this in other places
    // <BlurView intensity={85} tint='dark' style={styles.blurcontainer}>
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Places to Visit</Text>
        <IconButton
          icon={Icons.map}
          onPress={handleShowOnMap}
          size={32}
          containerStyle={styles.mapButton}
          color={'white'}
        />
      </View>
      {countryPlaces.length > 0 && (
        <ScrollView style={styles.listContainer}>
          {countryPlaces.map((place, index) => (
            <PlacesListItem
              key={generateRandomString()}
              place={place}
              onToggleFavorite={handleToggleFavorite}
              onToggleVisited={handleToggleVisited}
            />
          ))}
        </ScrollView>
      )}
      {!isFetching && countryPlaces.length === 0 && (
        <InfoText content='No places found...' style={styles.info} />
      )}
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          mode={ButtonMode.flat}
          onPress={onCancel}
          colorScheme={ColorScheme.neutral}
        >
          Close
        </Button>
        <Button
          colorScheme={ColorScheme.primary}
          onPress={handleAdd}
          style={styles.button}
        >
          Add Place
        </Button>
      </View>
    </Animated.View>
    // </BlurView>
  );
};

// TODO: Add filters, make cool Modal Gradient for use in other Modals => make Modal as separate Component to use in CurrencyModal and others

const styles = StyleSheet.create({
  blurcontainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: 'absolute',
    zIndex: 1,
    // maxHeight: '60%',
    height: '91%',
    width: '100%',
    // width: '80%',
    // marginHorizontal: 'auto',
    top: '9%',
    // marginVertical: 'auto',
    padding: 24,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GlobalStyles.colors.graySoft,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: GlobalStyles.colors.grayDark,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapButton: {
    backgroundColor: GlobalStyles.colors.grayMedium,
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.grayMedium,
  },
  info: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    marginHorizontal: 4,
  },
});

export default PlacesList;
