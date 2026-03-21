import { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ColorScheme } from '../../models';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { GlobalStyles } from '../../constants/styles';

interface FilterSettingsProps {
  filter: 'current' | 'all';
  setFilter: (filter: 'current' | 'all') => void;
  colorScheme?: ColorScheme;
}

const FilterSettings: React.FC<FilterSettingsProps> = ({
  filter,
  setFilter,
  colorScheme,
}): ReactElement => {
  let bg = GlobalStyles.colors.greenBg;
  if (colorScheme === ColorScheme.accent) {
    bg = GlobalStyles.colors.amberBg;
  } else if (colorScheme === ColorScheme.complementary) {
    bg = GlobalStyles.colors.purpleBg;
  }

  return (
    <Animated.View
      style={styles.container}
      entering={FadeInUp}
      exiting={FadeOutUp}
    >
      <Pressable
        style={[
          styles.button,
          filter === 'current' ? { backgroundColor: bg } : undefined,
        ]}
        onPress={() => setFilter('current')}
      >
        <Text style={styles.buttonText}>Current Stages</Text>
      </Pressable>
      <Pressable
        style={[
          styles.button,
          filter === 'all' ? { backgroundColor: bg } : undefined,
        ]}
        onPress={() => setFilter('all')}
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
    marginBottom: 10,
    marginHorizontal: 10,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  buttonText: {
    textAlign: 'center',
  },
});

export default FilterSettings;
