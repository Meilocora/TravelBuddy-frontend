import { ReactElement, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { GlobalStyles } from '../../constants/styles';
import { ButtonMode, ColorScheme, Journey } from '../../models';
import { ChartData, SpendingsList } from '../../../classes/SpendingsList';
import Legend from '../UI/chart/Legend';
import { formatAmount } from '../../utils';
import Button from '../UI/Button';
import OutsidePressHandler from 'react-native-outside-press';

interface UserProfileChartProps {
  journeys: Journey[];
}

const UserProfileChart: React.FC<UserProfileChartProps> = ({
  journeys,
}): ReactElement => {
  const [mode, setMode] = useState<'amount' | 'percentage'>('amount');

  const brightColors = [
    '#FF6F61',
    '#FFD700',
    '#40E0D0',
    '#FF69B4',
    '#7CFC00',
    '#00BFFF',
    '#FFA500',
  ];
  // TODO: Doenst work

  const spendingsList = new SpendingsList(brightColors, journeys);
  const totalAmount = spendingsList.getTotalAmount();
  const [chartData, setChartData] = useState<ChartData[]>(
    spendingsList.getChartData(mode)
  );

  useEffect(() => {
    setChartData(spendingsList.getChartData(mode));
  }, [mode]);

  const [selectedSection, setSelectedSection] = useState<ChartData>();

  function handleTapSection(item: ChartData) {
    setSelectedSection(item);
    setChartData((prevValues) =>
      prevValues.map((section) => ({
        ...section,
        focused: section.category === item.category,
      }))
    );
  }

  function handleOutsideTap() {
    setSelectedSection(undefined);
    setChartData((prevValues) =>
      prevValues.map((section) => ({
        ...section,
        focused: false,
      }))
    );
  }

  let centerLabelComponent = (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 20,
          color: GlobalStyles.colors.gray500,
          fontWeight: 'bold',
        }}
        numberOfLines={1}
      >
        {formatAmount(totalAmount)}
      </Text>
    </View>
  );

  if (selectedSection) {
    centerLabelComponent = (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 14,
            color: GlobalStyles.colors.gray500,
          }}
          numberOfLines={1}
        >
          {selectedSection.category}
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: GlobalStyles.colors.gray500,
            fontWeight: 'bold',
          }}
          numberOfLines={1}
        >
          {selectedSection.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === 'amount' ? (
        <Button
          colorScheme={ColorScheme.neutral}
          onPress={() => setMode('percentage')}
          mode={ButtonMode.flat}
          style={styles.button}
        >
          Show Percentages
        </Button>
      ) : (
        <Button
          colorScheme={ColorScheme.neutral}
          onPress={() => setMode('amount')}
          mode={ButtonMode.flat}
          style={styles.button}
        >
          Show Amounts
        </Button>
      )}
      <View style={styles.chart}>
        <OutsidePressHandler onOutsidePress={handleOutsideTap}>
          {chartData && (
            <PieChart
              data={chartData}
              sectionAutoFocus
              onPress={handleTapSection}
              centerLabelComponent={() => {
                return centerLabelComponent;
              }}
            />
          )}
        </OutsidePressHandler>
      </View>

      <Legend data={chartData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 20,
    justifyContent: 'center',
    alignContent: 'center',
    marginHorizontal: 'auto',
    backgroundColor: 'rgba(222, 226, 230, 0.5)',
    borderRadius: 20,
  },
  button: {
    width: '50%',
    marginHorizontal: 'auto',
  },
  chart: {
    alignItems: 'center',
  },
});

export default UserProfileChart;
