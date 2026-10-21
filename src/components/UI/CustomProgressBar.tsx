import { ReactElement, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlobalStyles } from '../../constants/styles';
import { DateProgress, getDateProgress } from '../../utils';

interface CustomProgressBarProps {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  style?: StyleProp<ViewStyle>;
}

function getLabels(info: DateProgress): { left: string; right: string } {
  switch (info.status) {
    case 'upcoming':
      return {
        left:
          info.daysUntilStart === 1
            ? 'Starts tomorrow'
            : `Starts in ${info.daysUntilStart} days`,
        right: `${info.totalDays} ${info.totalDays === 1 ? 'day' : 'days'}`,
      };
    case 'completed':
      return { left: 'Completed', right: '100%' };
    default:
      return {
        left: `Day ${info.currentDay} of ${info.totalDays}`,
        right: `${Math.round(info.progress * 100)}%`,
      };
  }
}

const CustomProgressBar: React.FC<CustomProgressBarProps> = ({
  startDate,
  endDate,
  style,
}): ReactElement | null => {
  const info = useMemo(
    () => getDateProgress(startDate, endDate),
    [startDate, endDate],
  );
  const progress = info?.progress ?? 0;

  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      // width can't be animated natively; JS driver keeps it safe in lists
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, animatedProgress]);

  if (!info) {
    return null;
  }

  const isCompleted = info.status === 'completed';
  const isUpcoming = info.status === 'upcoming';
  const { left, right } = getLabels(info);

  const fillWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const accentColor = isCompleted
    ? GlobalStyles.colors.grayMedium
    : GlobalStyles.colors.greenAccent;

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole='progressbar'
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      accessibilityLabel={left}
    >
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          <Ionicons
            name={
              isCompleted
                ? 'checkmark-circle'
                : isUpcoming
                  ? 'time-outline'
                  : 'airplane'
            }
            size={13}
            color={accentColor}
          />
          <Text style={[styles.label, { color: accentColor }]}>{left}</Text>
        </View>
        <Text style={styles.labelRight}>{right}</Text>
      </View>
      <View style={[styles.track, isUpcoming && styles.trackUpcoming]}>
        <Animated.View
          style={[
            styles.fill,
            { width: fillWidth, backgroundColor: accentColor },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '85%',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelRight: {
    fontSize: 12,
    fontStyle: 'italic',
    color: GlobalStyles.colors.grayMedium,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: GlobalStyles.colors.graySoft,
  },
  trackUpcoming: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: GlobalStyles.colors.grayMedium,
    backgroundColor: 'transparent',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default CustomProgressBar;
