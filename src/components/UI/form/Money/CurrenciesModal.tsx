import { ReactElement, useContext, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CurrencyInfo, Icons } from '../../../../models';
import { GlobalStyles } from '../../../../constants/styles';
import { UserContext } from '../../../../store/user-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import IconButton from '../../IconButton';
import Search from '../../../Locations/Search';

interface CurrenciesModalProps {
  onCloseModal: () => void;
  onSelectCurrency: (currency: CurrencyInfo) => void;
}

const CurrenciesModal: React.FC<CurrenciesModalProps> = ({
  onCloseModal,
  onSelectCurrency,
}): ReactElement => {
  const userCtx = useContext(UserContext);

  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  let currencies = userCtx.currencies;
  if (searchTerm !== '') {
    currencies = currencies.filter((currency) =>
      currency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function handleTapSearch() {
    setSearch((prevValue) => !prevValue);
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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.guestureContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Currencies</Text>
          </View>
          <View style={styles.iconButtonsContainer}>
            <IconButton
              icon={Icons.search}
              onPress={handleTapSearch}
              color={
                search || searchTerm
                  ? GlobalStyles.colors.amberAccent
                  : undefined
              }
            />
          </View>
        </View>
      </GestureDetector>
      {search && (
        <View style={styles.searchContainer}>
          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSearch={setSearch}
          />
        </View>
      )}
      <ScrollView style={styles.listContainer}>
        {currencies &&
          currencies.map((item) => (
            <Pressable
              key={item.code}
              style={styles.listRow}
              onPress={() => onSelectCurrency(item)}
              android_ripple={{ color: GlobalStyles.colors.grayMedium }}
            >
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name}>({item.name})</Text>
              <Text style={styles.conversionRate}>
                {(1 / item.conversionRate).toFixed(4).toString()} €
              </Text>
            </Pressable>
          ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: '25%',
    width: '100%',
    height: '91%',
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
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
  },
  searchContainer: {
    width: '100%',
  },
  listContainer: {
    width: '85%',
    maxHeight: '75%',
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
    zIndex: 2,
  },
  listRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginHorizontal: '5%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.grayDark,
    marginVertical: 3,
    alignItems: 'center',
  },
  symbol: {
    width: '20%',
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    width: '55%',
    fontStyle: 'italic',
  },
  conversionRate: {
    width: '25%',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.5,
  },
});

export default CurrenciesModal;
