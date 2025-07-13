import { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';

interface GridInfoLineProps {
  icon: Icons;
  value: string;
}

const GridInfoLine: React.FC<GridInfoLineProps> = ({
  icon,
  value,
}): ReactElement => {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={14}
        color={GlobalStyles.colors.gray200}
        style={styles.icon}
      />
      <Text style={styles.text} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  icon: {
    flex: 1,
    marginLeft: 30,
    marginRight: 10,
  },
  text: {
    flex: 4,
    color: GlobalStyles.colors.gray100,
  },
});

export default GridInfoLine;
