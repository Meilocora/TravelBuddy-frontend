import { ReactElement, useContext, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ButtonMode,
  ColorScheme,
  CurrencyInfo,
  Icons,
  StackParamList,
} from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../../UI/IconButton';
import Search from '../Search';
import Button from '../../UI/Button';
import { UserContext } from '../../../store/user-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface CurrenciesSelectorListProps {
  visible: boolean;
  onCancel: () => void;
  defaultCurrency: string | undefined;
  changeCurrency: (currency: string) => void;
  deleteCurrency: (currency: string) => void;
}

const CurrenciesSelectorList: React.FC<CurrenciesSelectorListProps> = ({
  visible,
  onCancel,
  defaultCurrency,
  changeCurrency,
  deleteCurrency,
}): ReactElement => {
  const userCtx = useContext(UserContext);

  const currencyNavigator =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  let currencies = userCtx.currencies.filter((c) => c.code !== defaultCurrency);

  const currencyObj = userCtx.currencies?.find(
    (c) => c.code === defaultCurrency
  );

  if (sort === 'desc') {
    currencies = [...currencies].sort((a, b) => b.name.localeCompare(a.name));
  } else {
    currencies = [...currencies].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (searchTerm !== '') {
    currencies = currencies.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function handleTapAddCurrency() {
    onCancel();
    currencyNavigator.navigate('ManageCustomCurrency', {});
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

  function handleLongPress(currency: CurrencyInfo) {
    if (currency.id) {
      onCancel();
      currencyNavigator.navigate('ManageCustomCurrency', {
        currencyId: currency.id,
      });
    }
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
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Currencies</Text>
          </View>
          {defaultCurrency && (
            <View>
              {currencyObj ? (
                <Pressable
                  key={currencyObj.code}
                  style={[
                    styles.listRow,
                    { borderColor: GlobalStyles.colors.greenAccent },
                    currencyObj.id
                      ? { backgroundColor: GlobalStyles.colors.amberSoft }
                      : undefined,
                  ]}
                  onPress={() => deleteCurrency(currencyObj.code)}
                  onLongPress={() => handleLongPress(currencyObj)}
                  android_ripple={{ color: GlobalStyles.colors.grayMedium }}
                >
                  <Text
                    style={[
                      styles.symbol,
                      { color: GlobalStyles.colors.greenAccent },
                    ]}
                  >
                    {currencyObj.symbol}
                  </Text>
                  <Text
                    style={[
                      styles.name,
                      { color: GlobalStyles.colors.greenAccent },
                    ]}
                  >
                    ({currencyObj.name})
                  </Text>
                  <Text
                    style={[
                      styles.conversionRate,
                      { color: GlobalStyles.colors.greenAccent },
                    ]}
                  >
                    {(1 / currencyObj.conversionRate).toFixed(4).toString()} €
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  key={defaultCurrency}
                  style={styles.listRow}
                  onPress={() => deleteCurrency(defaultCurrency)}
                  android_ripple={{ color: GlobalStyles.colors.grayMedium }}
                >
                  <Text style={styles.symbol}>{defaultCurrency}</Text>
                </Pressable>
              )}
            </View>
          )}
          <View style={styles.iconButtonsContainer}>
            <IconButton
              icon={Icons.add}
              onPress={handleTapAddCurrency}
              color={GlobalStyles.colors.grayDark}
            />
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
                  ? GlobalStyles.colors.greenAccent
                  : undefined
              }
            />
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
            {currencies &&
              currencies.map((item) => (
                <Pressable
                  key={item.code}
                  style={[
                    styles.listRow,
                    item.id
                      ? { backgroundColor: GlobalStyles.colors.amberSoft }
                      : undefined,
                  ]}
                  onPress={() => changeCurrency(item.code)}
                  onLongPress={() => handleLongPress(item)}
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
    height: Dimensions.get('window').height * 0.9,
    width: '90%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderColor: GlobalStyles.colors.grayMedium,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 2,
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
  chosenListElementContainer: {
    borderColor: GlobalStyles.colors.greenAccent,
  },
  chosenListElement: {
    color: GlobalStyles.colors.greenAccent,
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
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },
  listRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 10,
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
  dismissButton: {
    marginHorizontal: 'auto',
  },
  dismissButtonText: {
    color: GlobalStyles.colors.grayMedium,
  },
});

export default CurrenciesSelectorList;
