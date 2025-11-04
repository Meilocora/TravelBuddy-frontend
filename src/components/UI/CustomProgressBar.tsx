import { ReactElement } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { GlobalStyles } from '../../constants/styles';
import {
  formatCountdown,
  formatCountdownDays,
  formatProgress,
} from '../../utils';

interface CustomProgressBarProps {
  startDate: string;
  endDate: string;
}

const CustomProgressBar: React.FC<CustomProgressBarProps> = ({
  startDate,
  endDate,
}): ReactElement => {
  const progress = formatProgress(startDate, endDate);
  const prettyProgress = (progress * 100).toFixed(2) + '%';
  const isOver = progress >= 1;

  const countdown = formatCountdownDays(startDate);

  return (
    <View style={styles.progressBarContainer}>
      <ProgressBar
        progress={progress}
        color={GlobalStyles.colors.greenDark}
        style={styles.progressBar}
        fillStyle={{
          backgroundColor: isOver
            ? GlobalStyles.colors.grayMedium
            : GlobalStyles.colors.greenAccent,
        }}
      />
      {progress > 0 ? (
        <Text style={styles.text}>{prettyProgress}</Text>
      ) : (
        <Text style={styles.text}>Starts in {countdown} days.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressBar: {
    height: 10,
    marginHorizontal: 'auto',
    width: '80%',
    borderWidth: 1,
    borderColor: GlobalStyles.colors.greenDark,
    borderRadius: 25,
  },
  text: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
});

export default CustomProgressBar;
