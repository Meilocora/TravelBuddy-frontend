import { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { StageFilter } from '../../models';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { GlobalStyles } from '../../constants/styles';

interface FilterSettingsProps {
  filter: StageFilter;
  setFilter: (filter: StageFilter) => void;
}

const FilterSettings: React.FC<FilterSettingsProps> = ({
  filter,
  setFilter,
}): ReactElement => {
  return (
    <Animated.View
      style={styles.container}
      entering={FadeInUp}
      exiting={FadeOutUp}
    >
      <Pressable
        style={[
          styles.button,
          filter === StageFilter.current ? styles.activeButton : undefined,
        ]}
        onPress={() => setFilter(StageFilter.current)}
      >
        <Text style={styles.buttonText}>Current Stages</Text>
      </Pressable>
      <Pressable
        style={[
          styles.button,
          filter === StageFilter.all ? styles.activeButton : undefined,
        ]}
        onPress={() => setFilter(StageFilter.all)}
      >
        <Text style={styles.buttonText}>All Stages</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 120,
    marginVertical: 10,
    marginHorizontal: 10,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  activeButton: {
    backgroundColor: GlobalStyles.colors.gray50,
  },
  buttonText: {
    textAlign: 'center',
  },
});

export default FilterSettings;
