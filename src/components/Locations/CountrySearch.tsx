import { ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';

import Input from '../UI/form/Input';
import { GlobalStyles } from '../../constants/styles';

interface CountrySearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setSearch: (value: boolean) => void;
}

const CountrySearch: React.FC<CountrySearchProps> = ({
  searchTerm,
  setSearchTerm,
  setSearch,
}): ReactElement => {
  const searchTermLabel = 'SearchTerm';

  function inputChangedHandler(value: string) {
    setSearchTerm(value);
  }

  return (
    <OutsidePressHandler onOutsidePress={() => setSearch(false)}>
      <Animated.View
        entering={FadeInUp}
        exiting={FadeOutUp}
        style={styles.outerContainer}
      >
        <View style={styles.innerContainer}>
          <Input
            errors={[]}
            invalid={false}
            label={searchTermLabel}
            textInputConfig={{
              value: searchTerm,
              onChangeText: inputChangedHandler,
              cursorColor: GlobalStyles.colors.gray700,
            }}
            customInputStyles={styles.input}
          />
        </View>
      </Animated.View>
    </OutsidePressHandler>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 5,
    width: '75%',
    marginHorizontal: 'auto',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 75,
  },
  input: {
    backgroundColor: GlobalStyles.colors.gray50,
    color: GlobalStyles.colors.gray700,
  },
});

export default CountrySearch;
