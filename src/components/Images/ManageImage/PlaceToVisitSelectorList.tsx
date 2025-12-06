import { ReactElement, useContext, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  CustomCountry,
  Icons,
  MapLocation,
  PlaceToVisit,
  StackParamList,
} from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../../UI/IconButton';
import Search from '../../Locations/Search';
import ListItem from '../../UI/search/ListItem';
import { PlaceContext } from '../../../store/place-context';
import CountrySelector from './CountrySelector';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { UserContext } from '../../../store/user-context';
import { CustomCountryContext } from '../../../store/custom-country-context';

interface PlaceToVisitSelectorListProps {
  visible: boolean;
  onCancel: () => void;
  onChangePlace: (placeId: number | undefined) => void;
  defaultValue: PlaceToVisit | '';
}

const PlaceToVisitSelectorList: React.FC<PlaceToVisitSelectorListProps> = ({
  visible,
  onCancel,
  onChangePlace,
  defaultValue,
}): ReactElement => {
  const countryCtx = useContext(CustomCountryContext);
  const placesCtx = useContext(PlaceContext);
  const userCtx = useContext(UserContext);

  const navigation = useNavigation<NavigationProp<StackParamList>>();

  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<
    undefined | CustomCountry
  >();

  let places = placesCtx.placesToVisit;

  if (defaultValue) {
    places = places?.filter((p) => p.id !== defaultValue!.id);
  }

  if (places) {
    if (sort === 'desc') {
      places = places.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      places = places.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (searchTerm !== '') {
      places = places.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (countryFilter) {
      places = places.filter((p) => p.countryId === countryFilter.id);
    }
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

  function handleTapCountrySelector(country: CustomCountry | undefined) {
    setCountryFilter(country);
  }

  function handlePressListElement(place: PlaceToVisit) {
    onChangePlace(place.id);
    onCancel();
  }

  function handleSelectPlace(location: MapLocation) {
    const place = placesCtx.findPlaceByMapLocation(location);
    if (!place) {
      return;
    }
    onChangePlace(place.id);
  }

  function handleShowOnMap() {
    const countryIds = countryCtx.getCustomCountriesIds();
    navigation.navigate('LocationPickMap', {
      hasLocation: false,
      initialLat: userCtx.currentLocation?.latitude || 0,
      initialLng: userCtx.currentLocation?.longitude || 0,
      initialTitle: undefined,
      onPickLocation: handleSelectPlace,
      onPressMarker: handleSelectPlace,
      customCountryIds: countryIds,
      noMapTouch: true,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.guestureContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Places To Visit</Text>
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
                color={
                  sort === 'desc' ? GlobalStyles.colors.greenAccent : undefined
                }
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
                    ? GlobalStyles.colors.greenAccent
                    : undefined
                }
              />
              <CountrySelector
                onChangeCountry={handleTapCountrySelector}
                currentCountry={countryFilter}
              />
            </View>
          </View>
          {search && (
            <View style={styles.searchContainer}>
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </View>
          )}

          <ScrollView
            style={styles.listContainer}
            nestedScrollEnabled
            scrollEnabled
          >
            {places &&
              places.length > 0 &&
              places.map((place) => (
                <ListItem
                  key={place.id}
                  onPress={() => handlePressListElement(place)}
                >
                  {place.name}
                </ListItem>
              ))}
          </ScrollView>

          <Button
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
            onPress={onCancel}
            style={styles.dismissButton}
            textStyle={styles.dismissButtonText}
          >
            Dismiss
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: Dimensions.get('window').height * 0.8,
    width: '90%',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderColor: GlobalStyles.colors.grayMedium,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 2,
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
    height: Dimensions.get('window').height * 0.8,
    width: '80%',
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },
  dismissButton: {
    marginHorizontal: 'auto',
  },
  dismissButtonText: {
    color: GlobalStyles.colors.grayMedium,
  },
});

export default PlaceToVisitSelectorList;
