import { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';

interface StageDatesProps {
  startDate: string;
  endDate: string;
}

const StageDates: React.FC<StageDatesProps> = ({
  startDate,
  endDate,
}): ReactElement => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.containerRow}>
          <Text style={styles.text}>Starts:</Text>
          <Text style={styles.dateText}>{startDate}</Text>
        </View>
        <View style={styles.containerRow}>
          <Text style={styles.text}>Ends:</Text>
          <Text style={styles.dateText}>{endDate}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  innerContainer: {
    backgroundColor: GlobalStyles.colors.grayDark,
    color: 'white',
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
    marginVertical: 2,
  },
  containerRow: {
    marginVertical: 5.5,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    color: 'white',
    fontSize: 14,
    flexWrap: 'wrap',
  },
  dateText: {
    textAlign: 'right',
    color: 'white',
    fontSize: 14,
    flexWrap: 'wrap',
  },
});

export default StageDates;
