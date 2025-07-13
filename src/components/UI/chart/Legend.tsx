import { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ChartData } from '../../../../classes/SpendingsList';
import { GlobalStyles } from '../../../constants/styles';
import { generateRandomString } from '../../../utils';

interface LegendProps {
  data: ChartData[];
}

const Legend: React.FC<LegendProps> = ({ data }): ReactElement => {
  const renderDot = (color: string) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 5,
          borderWidth: 0.2,
        }}
      />
    );
  };

  return (
    <>
      <View style={styles.container}>
        {data.map((dataPoint) => {
          return (
            <View style={styles.legendElement} key={generateRandomString()}>
              {renderDot(dataPoint.color)}
              <View style={styles.textWrapper}>
                <Text style={styles.text} numberOfLines={1}>
                  {dataPoint.category}:
                </Text>
                <Text style={styles.value}>{dataPoint.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
    flexWrap: 'wrap',
    paddingBottom: 5,
  },
  legendElement: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  textWrapper: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 12,
    flexWrap: 'nowrap',
    color: GlobalStyles.colors.gray700,
  },
  value: {
    fontSize: 12,
    flexWrap: 'nowrap',
    color: GlobalStyles.colors.gray700,
    fontWeight: 'bold',
  },
});

export default Legend;
