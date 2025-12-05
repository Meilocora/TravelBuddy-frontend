import { ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';

import Input from '../UI/form/Input';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';

interface SearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({
  searchTerm,
  setSearchTerm,
}): ReactElement => {
  const searchTermLabel = 'SearchTerm';

  function inputChangedHandler(value: string) {
    setSearchTerm(value);
  }

  return (
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
          }}
          customInputStyles={styles.input}
        />
      </View>
      <IconButton
        icon={Icons.delete}
        color={GlobalStyles.colors.graySoft}
        onPress={() => setSearchTerm('')}
        size={32}
        style={styles.icon}
      />
    </Animated.View>
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
  },
  icon: {
    position: 'absolute',
    top: 24,
    right: -3,
  },
});

export default Search;
