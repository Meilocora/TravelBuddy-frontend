import { ReactElement, useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import OutsidePressHandler from 'react-native-outside-press';

import { ButtonMode, ColorScheme, CurrencyInfo } from '../../../../models';
import Button from '../../Button';
import ListItem from '../../search/ListItem';
import { generateRandomString } from '../../../../utils';
import { GlobalStyles } from '../../../../constants/styles';
import { UserContext } from '../../../../store/user-context';

interface CurrenciesModalProps {
  onCloseModal: () => void;
  onSelectCurrency: (currency: CurrencyInfo) => void;
}

const CurrenciesModal: React.FC<CurrenciesModalProps> = ({
  onCloseModal,
  onSelectCurrency,
}): ReactElement => {
  const userCtx = useContext(UserContext);
  return (
    <View style={styles.outerContainer}>
      <OutsidePressHandler onOutsidePress={onCloseModal}>
        <View style={styles.innerContainer}>
          <ScrollView style={styles.list} nestedScrollEnabled>
            {userCtx.currencies &&
              userCtx.currencies.map((item) => (
                <ListItem
                  key={generateRandomString()}
                  onPress={() => onSelectCurrency(item)}
                >
                  {`${item.currency} ~ ${(1 / item.conversionRate)
                    .toFixed(4)
                    .toString()} €`}
                </ListItem>
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
        </View>
      </OutsidePressHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 1,
    position: 'absolute',
    width: '100%',
  },
  innerContainer: {
    marginHorizontal: 'auto',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: GlobalStyles.colors.gray500,
    maxHeight: '50%',
    maxWidth: '120%',
    borderWidth: 1,
    borderRadius: 15,
  },
  list: {
    paddingHorizontal: 5,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.gray100,
  },
  info: {
    marginVertical: 4,
    marginTop: 4,
  },
  button: {
    marginVertical: 2,
    marginHorizontal: 'auto',
    alignSelf: 'flex-start',
  },
});

export default CurrenciesModal;
