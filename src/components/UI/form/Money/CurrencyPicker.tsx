import { ReactElement, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ViewStyle,
  Modal,
} from 'react-native';

import { CurrencyInfo } from '../../../../models';
import { formatAmount } from '../../../../utils';
import Input from '../Input';
import { GlobalStyles } from '../../../../constants/styles';
import CurrenciesModal from './CurrenciesModal';
import { UserContext } from '../../../../store/user-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface CurrencyPickerProps {
  unconvertedValue: string;
  style: ViewStyle;
  field: string;
  inputChangedHandler: (inputIdentifier: string, enteredValue: number) => void;
}

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  unconvertedValue,
  style,
  field,
  inputChangedHandler,
}): ReactElement => {
  const [error, setError] = useState<string>();
  const [placeHolder, setPlaceHolder] = useState('');

  const userCtx = useContext(UserContext);

  const localCurrency: CurrencyInfo = {
    code: userCtx.localCurrency.code,
    name: userCtx.localCurrency.name,
    symbol: userCtx.localCurrency.symbol,
    conversionRate: userCtx.localCurrency.conversionRate,
  };

  const [chosenCurrency, setChosenCurrency] =
    useState<CurrencyInfo>(localCurrency);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    calculateConvertedAmount();
  }, [unconvertedValue]);

  function selectCurrency(currency: CurrencyInfo) {
    setChosenCurrency(currency);
    setShowModal(false);
    calculateConvertedAmount(currency.conversionRate);
  }

  function calculateConvertedAmount(conversionRate?: number) {
    // Optional input, so the converted amount is instantly recalculated, when the user changes the Currency
    let convertedValue = 0;
    if (conversionRate) {
      convertedValue = parseFloat(unconvertedValue) / conversionRate;
    } else {
      convertedValue =
        parseFloat(unconvertedValue) / chosenCurrency.conversionRate;
    }

    if (unconvertedValue.includes(',')) {
      setPlaceHolder('NaN');
      inputChangedHandler(field, 0);
      return;
    } else if (
      parseFloat(unconvertedValue) === 0 ||
      parseFloat(unconvertedValue).toString() === 'NaN'
    ) {
      inputChangedHandler(field, 0);
      setPlaceHolder(`0,00 €`);
      return;
    }

    if (convertedValue > 999) {
      setPlaceHolder(
        formatAmount(parseFloat(convertedValue.toFixed(0))).toString()
      );
    } else {
      setPlaceHolder(`${convertedValue.toFixed(2).toString()} €`);
    }

    inputChangedHandler(field, parseFloat(convertedValue.toFixed(2)));
  }

  return (
    <>
      <Modal
        visible={showModal && !!userCtx.currencies}
        transparent
        animationType='slide'
        onRequestClose={() => setShowModal(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CurrenciesModal
            onCloseModal={() => setShowModal(false)}
            onSelectCurrency={selectCurrency}
          />
        </GestureHandlerRootView>
      </Modal>
      <View style={[styles.container, style]}>
        <View style={styles.currencySymbol}>
          <Pressable
            onPress={() => setShowModal(true)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.currencyText}>{chosenCurrency.symbol}</Text>
          </Pressable>
        </View>
        {chosenCurrency.code !== 'EUR' && placeHolder !== '' && (
          <Input
            label=''
            maxLength={100}
            invalid={false}
            errors={[]}
            textInputConfig={{
              readOnly: true,
              placeholder: placeHolder,
            }}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  currencySymbol: {
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 33,
    backgroundColor: GlobalStyles.colors.grayDark,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.5,
  },
  currencyText: {
    fontSize: 22,
    color: GlobalStyles.colors.graySoft,
    fontStyle: 'italic',
    width: 45,
    textAlign: 'center',
  },
});

export default CurrencyPicker;
