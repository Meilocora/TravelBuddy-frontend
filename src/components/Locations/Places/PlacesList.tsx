import { ReactElement, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import PlacesListItem from './PlacesListItem';
import { generateRandomString } from '../../../utils';
import Button from '../../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  PlaceToVisit,
  StackParamList,
} from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { PlaceContext } from '../../../store/place-context';
import InfoText from '../../UI/InfoText';
import LocationPicker from '../../UI/form/LocationPicker';

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

  return (
    <BlurView intensity={85} tint='dark' style={styles.blurcontainer}>
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={styles.container}
      >
        <Text style={styles.header}>Places to Visit</Text>
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
    </BlurView>
  );
};

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
    maxHeight: '60%',
    width: '80%',
    marginHorizontal: 'auto',
    marginVertical: 'auto',
    padding: 24,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GlobalStyles.colors.gray700,
    borderRadius: 20,
  },
  header: {
    color: GlobalStyles.colors.gray50,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 22,
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.gray400,
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
