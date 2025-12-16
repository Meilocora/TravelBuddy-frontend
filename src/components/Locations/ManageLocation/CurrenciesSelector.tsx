import { ReactElement, useContext, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Input from '../../UI/form/Input';
import { FormLimits } from '../../../models';
import { UserContext } from '../../../store/user-context';
import CurrenciesSelectorList from './CurrenciesSelectorList';

interface CurrenciesSelectorProps {
  currencyCode: string[] | undefined;
  onChangeCurrencies: (currencies: string[] | undefined) => void;
}

const CurrenciesSelector: React.FC<CurrenciesSelectorProps> = ({
  currencyCode,
  onChangeCurrencies,
}): ReactElement => {
  const userCtx = useContext(UserContext);

  const [showModal, setShowModal] = useState(false);

  const trimmedMainCurrency = currencyCode && currencyCode[0].trim();
  const currencyObj = userCtx.currencies?.find(
    (c) => c.code === trimmedMainCurrency
  );

  let shownValue = '';
  if (currencyObj) {
    shownValue = `${currencyObj.name} (${currencyObj.code}) \n1${
      currencyObj.symbol
    } ~ ${(1 / currencyObj.conversionRate).toFixed(2)}€`;
  } else if (trimmedMainCurrency) {
    shownValue = trimmedMainCurrency;
  }

  function handleChangeCurrency(currency: string) {
    onChangeCurrencies([currency]);
  }

  function handleDeleteCurrency() {
    onChangeCurrencies(['']);
  }

  return (
    <>
      <CurrenciesSelectorList
        defaultCurrency={trimmedMainCurrency}
        changeCurrency={handleChangeCurrency}
        deleteCurrency={handleDeleteCurrency}
        visible={showModal}
        onCancel={() => setShowModal(false)}
      />
      <Pressable onPress={() => setShowModal(true)} style={styles.container}>
        <Input
          label='Currency'
          maxLength={FormLimits.countryLanguages}
          invalid={false}
          errors={[]}
          textInputConfig={{
            value: shownValue,
            readOnly: true,
          }}
        />
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CurrenciesSelector;
