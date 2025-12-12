import React, { ReactElement, useEffect, useState } from 'react';
import { Dimensions, Text, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { generateRandomString } from '../../../utils';
import InfoText from '../../UI/InfoText';
import { GlobalStyles } from '../../../constants/styles';
import ListItem from '../../UI/search/ListItem';
import { FetchCustomCountryResponseProps } from '../../../utils/http/custom_country';
import Button from '../../UI/Button';
import { BottomTabsParamList, ColorScheme, Icons } from '../../../models';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import IconButton from '../../UI/IconButton';
import Search from '../../Locations/Search';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface CountriesSelectionProps {
  onFetchRequest: (
    journeyId?: number
  ) => Promise<FetchCustomCountryResponseProps>;
  onAddHandler: (addedItem: string) => void;
  onCloseModal: () => void;
  chosenCountries: string[];
  top?: number;
  singleSelect?: boolean;
}

const CountriesSelection = ({
  onFetchRequest,
  onAddHandler,
  onCloseModal,
  chosenCountries,
  top,
  singleSelect = false,
}: CountriesSelectionProps): ReactElement => {
  const navigation = useNavigation<NavigationProp<BottomTabsParamList>>();
  const [fetchedData, setFetchedData] = useState<string[]>([]);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const { data } = await onFetchRequest();
      if (data) {
        const names = data.map((item) => item.name);
        const namesNotChosen = names.filter(
          (name) => !chosenCountries.includes(name)
        );

        let countries = namesNotChosen;
        if (sort === 'desc') {
          countries = [...countries].sort((a, b) => b.localeCompare(a));
        } else {
          countries = [...countries].sort((a, b) => a.localeCompare(b));
        }

        if (searchTerm !== '') {
          countries = countries.filter((country) =>
            country.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setFetchedData(countries);
      }
    }

    fetchData();
  }, [chosenCountries, sort, search, searchTerm]);

  function handlePressListElement(item: string) {
    onAddHandler(item);
    singleSelect && onCloseModal();
  }

  function handlePressAdd() {
    navigation.navigate('Locations');
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

  // Drag-to-dismiss logic
  const translateY = useSharedValue(0);
  const isDismissing = useSharedValue(false); // Guard: verhindert mehrfaches Dismiss

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
              runOnJS(onCloseModal)(); // Aufruf im JS-Thread nachdem Animation fertig ist
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

  let content: ReactElement | null = null;

  if (fetchedData.length > 0) {
    content = (
      <>
        <ScrollView style={styles.list} nestedScrollEnabled>
          {fetchedData.map((item) => (
            <ListItem
              key={generateRandomString()}
              onPress={handlePressListElement.bind(item)}
            >
              {item}
            </ListItem>
          ))}
        </ScrollView>
      </>
    );
  } else {
    content = (
      <>
        <InfoText content='No items found' style={styles.info} />
        <Button
          colorScheme={ColorScheme.accent}
          onPress={handlePressAdd}
          style={styles.button}
        >
          Add Country!
        </Button>
      </>
    );
  }

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={[
        styles.outerContainer,
        { height: windowHeight * 0.9, width: windowWidth },
        animatedStyle,
        top ? { top: top } : undefined,
      ]}
    >
      <>
        <GestureDetector gesture={panGesture}>
          <View style={styles.guestureContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Choose a country</Text>
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
            </View>
          </View>
        </GestureDetector>
        {search && (
          <View style={styles.searchContainer}>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </View>
        )}
        {content}
      </>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: -320,
    zIndex: 30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: GlobalStyles.colors.greenSoft,
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
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  searchContainer: {
    width: '100%',
  },
  list: {
    maxHeight: 410,
    width: '80%',
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },
  info: {
    marginVertical: 4,
    marginTop: 4,
  },
  button: {
    marginVertical: 8,
    marginHorizontal: 'auto',
    alignSelf: 'flex-start',
  },
});

export default CountriesSelection;
