import { ReactElement } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../IconButton';
import { Icons } from '../../../models';

export type CheckBoxMode = 'favorite' | 'visited' | 'booked';

interface CustomCheckBoxProps {
  value: boolean;
  mode: CheckBoxMode;
  onPress: () => void;
}

const CustomCheckBox: React.FC<CustomCheckBoxProps> = ({
  value,
  mode,
  onPress,
}): ReactElement => {
  let label = 'Favorite';
  if (mode === 'visited') {
    label = 'Visited';
  } else if (mode === 'booked') {
    label = 'Booked';
  }
  if (value === true) {
    label += '!';
  } else {
    label += '?';
  }

  return (
    <View style={styles.checkBoxContainer}>
      <Text style={styles.checkBoxLabel}>{label}</Text>
      {mode === 'favorite' ? (
        <IconButton
          icon={value ? Icons.heartFilled : Icons.heartOutline}
          onPress={onPress}
          color={
            value ? GlobalStyles.colors.favorite : GlobalStyles.colors.grayDark
          }
          containerStyle={styles.icon}
          size={30}
        />
      ) : mode === 'visited' ? (
        <IconButton
          icon={value ? Icons.eye : Icons.eyeOn}
          onPress={onPress}
          color={
            value ? GlobalStyles.colors.visited : GlobalStyles.colors.grayDark
          }
          containerStyle={styles.icon}
          size={30}
        />
      ) : (
        <IconButton
          icon={value ? Icons.bookFilled : Icons.bookOutline}
          onPress={onPress}
          color={GlobalStyles.colors.grayDark}
          containerStyle={styles.icon}
          size={30}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  checkBoxContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 'auto',
    marginBottom: '5%',
  },
  checkBoxLabel: {
    color: GlobalStyles.colors.grayDark,
  },
  icon: {
    margin: 0,
    padding: 0,
  },
});

export default CustomCheckBox;
