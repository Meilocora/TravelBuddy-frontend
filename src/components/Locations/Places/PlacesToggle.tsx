import { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { GlobalStyles } from '../../../constants/styles';

interface PlacesToggleProps {
  isShowingPlaces: boolean;
  handleTogglePlaces: () => void;
}

const PlacesToggle: React.FC<PlacesToggleProps> = ({
  isShowingPlaces,
  handleTogglePlaces,
}): ReactElement => {
  return (
    <Pressable
      onPress={handleTogglePlaces}
      style={[styles.container, isShowingPlaces && styles.activeContainer]}
    >
      <Text style={[styles.text, isShowingPlaces && styles.activeText]}>
        Show Places to visit
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 175,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 'auto',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.grayDark,
    borderRadius: 25,
  },
  activeContainer: {
    borderColor: GlobalStyles.colors.greenAccent,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: GlobalStyles.colors.grayDark,
    textAlign: 'center',
  },
  activeText: {
    color: GlobalStyles.colors.greenAccent,
  },
});

export default PlacesToggle;
