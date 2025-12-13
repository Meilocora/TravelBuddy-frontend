import { ReactElement, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import PlacesListItem from './PlacesListItem';
import Button from '../../UI/Button';
import {
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
import Search from '../Search';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

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
  const [isFav, setIsFav] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all places to visit for this country
  useEffect(() => {
    function getPlaces() {
      const fetchedPlaces = placesCtx.getPlacesByCountry(countryId);
      // setCountryPlaces(fetchedPlaces);
      setIsFetching(false);

      let places = fetchedPlaces;
      if (sort === 'desc') {
        places = [...places].sort((a, b) => b.name.localeCompare(a.name));
      } else {
        places = [...places].sort((a, b) => a.name.localeCompare(b.name));
      }

      if (isFav) {
        places = [...places].filter((place) => place.favorite === true);
      }

      if (isVisited) {
        places = [...places].filter((place) => place.visited === true);
      }

      if (searchTerm !== '') {
        places = places.filter((place) =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setCountryPlaces(places);
    }

    getPlaces();
  }, [
    countryId,
    placesCtx.placesToVisit,
    sort,
    search,
    searchTerm,
    isFav,
    isVisited,
  ]);

  function handleAdd() {
    navigation.navigate('ManagePlaceToVisit', {
      placeId: null,
      countryId: countryId,
    });
  }

  function handleTapSort() {
    if (sort === 'asc') {
      setSort('desc');
    } else {
      setSort('asc');
    }
  }

  function handleTapSearch() {
    setSearch((prevValue) => !prevValue);
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
      customCountryIds: [countryId],
    });
  }

  // Drag-to-dismiss logic
  const translateY = useSharedValue(0);
  const isDismissing = useSharedValue(false); // Guard: verhindert mehrfaches Dismiss

  const windowHeight = Dimensions.get('window').height;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // nur wenn noch nicht im Dismiss- Ablauf
      if (!isDismissing.value && event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (isDismissing.value) return; // bereits unterwegs -> nichts tun

      if (event.translationY > 100) {
        // Starte das Slide-Down bis außerhalb des Screens, dann runOnJS(onCancel)
        isDismissing.value = true;
        translateY.value = withSpring(
          windowHeight,
          {
            mass: 2,
            damping: 25,
            stiffness: 100,
          },
          (isFinished) => {
            if (isFinished) {
              runOnJS(onCancel)(); // Aufruf im JS-Thread nachdem Animation fertig ist
            }
          }
        );
      } else {
        // Zurückfederung nach oben
        translateY.value = withSpring(0, {
          mass: 2,
          damping: 25,
          stiffness: 100,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={[styles.container, animatedStyle]}
    >
      <GestureDetector gesture={panGesture}>
        <View style={styles.guestureContainer}>
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
          <View style={styles.iconButtonsContainer}>
            <IconButton
              icon={Icons.filter}
              onPress={handleTapSort}
              color={GlobalStyles.colors.grayDark}
              style={
                sort === 'desc'
                  ? { transform: [{ rotate: '180deg' }] }
                  : undefined
              }
            />
            <IconButton
              icon={Icons.search}
              onPress={handleTapSearch}
              color={
                search || searchTerm
                  ? GlobalStyles.colors.amberAccent
                  : undefined
              }
            />
            <IconButton
              icon={isFav ? Icons.heartFilled : Icons.heartOutline}
              onPress={() => setIsFav((prevValue) => !prevValue)}
              color={isFav ? GlobalStyles.colors.favorite : undefined}
            />
            <IconButton
              icon={isVisited ? Icons.checkmarkFilled : Icons.checkmarkOutline}
              onPress={() => setIsVisited((prevValue) => !prevValue)}
              color={isVisited ? GlobalStyles.colors.visited : undefined}
            />
          </View>
        </View>
      </GestureDetector>
      {search && (
        <View style={styles.searchContainer}>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </View>
      )}
      {isFetching ? (
        <ActivityIndicator size='large' color={GlobalStyles.colors.grayDark} />
      ) : (
        countryPlaces.length > 0 && (
          <ScrollView
            style={styles.listContainer}
            nestedScrollEnabled
            scrollEnabled
          >
            {countryPlaces.map((place, index) => (
              <PlacesListItem
                key={place.id ? place.id.toString() : place.name}
                place={place}
                index={index}
                onToggleFavorite={handleToggleFavorite}
                onToggleVisited={handleToggleVisited}
              />
            ))}
          </ScrollView>
        )
      )}
      {!isFetching && countryPlaces.length === 0 && (
        <InfoText content='No places found...' style={styles.info} />
      )}
      <View style={styles.buttonContainer}>
        <Button
          colorScheme={ColorScheme.neutral}
          onPress={handleAdd}
          style={styles.button}
        >
          Add Place
        </Button>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1,
    height: '91%',
    width: '100%',
    top: '9%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: GlobalStyles.colors.graySoft,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderWidth: 2,
  },
  guestureContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  searchContainer: {
    width: '100%',
  },
  listContainer: {
    width: '80%',
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },
  info: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  button: {
    marginHorizontal: 4,
  },
});

export default PlacesList;
