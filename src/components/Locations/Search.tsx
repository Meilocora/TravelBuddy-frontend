import { ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';

import Input from '../UI/form/Input';
import { GlobalStyles } from '../../constants/styles';

interface SearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setSearch: (value: boolean) => void;
}

const Search: React.FC<SearchProps> = ({
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
            maxLength={100}
            invalid={false}
            label={searchTermLabel}
            textInputConfig={{
              value: searchTerm,
              onChangeText: inputChangedHandler,
              cursorColor: GlobalStyles.colors.grayDark,
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
    backgroundColor: GlobalStyles.colors.grayMedium,
    color: GlobalStyles.colors.grayDark,
    borderColor: GlobalStyles.colors.grayDark,
    borderWidth: 0.5,
  },
});

export default Search;
