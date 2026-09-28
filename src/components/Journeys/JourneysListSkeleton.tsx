import { ReactElement, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GlobalStyles } from '../../constants/styles';

const PLACEHOLDER_COUNT = 3;

interface SkeletonBlockProps {
  style?: object;
  shimmerStyle: object;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  style,
  shimmerStyle,
}): ReactElement => {
  return <Animated.View style={[styles.skeletonBase, style, shimmerStyle]} />;
};

const JourneysListSkeleton: React.FC = (): ReactElement => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [animation]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.value, [0, 1], [0.4, 1]),
    };
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <Animated.View key={index} style={[styles.card, shimmerStyle]}>
          <View style={styles.actionsColumn}>
            <SkeletonBlock
              style={styles.actionIcon}
              shimmerStyle={shimmerStyle}
            />
            <SkeletonBlock
              style={styles.actionIcon}
              shimmerStyle={shimmerStyle}
            />
          </View>

          <View style={styles.content}>
            <SkeletonBlock style={styles.title} shimmerStyle={shimmerStyle} />
            <SkeletonBlock
              style={styles.subtitle}
              shimmerStyle={shimmerStyle}
            />

            <View style={styles.detailsGrid}>
              <SkeletonBlock
                style={styles.detailCell}
                shimmerStyle={shimmerStyle}
              />
              <SkeletonBlock
                style={styles.detailCell}
                shimmerStyle={shimmerStyle}
              />
              <SkeletonBlock
                style={styles.detailCell}
                shimmerStyle={shimmerStyle}
              />
              <SkeletonBlock
                style={styles.detailCell}
                shimmerStyle={shimmerStyle}
              />
            </View>

            <View style={styles.badgesRow}>
              <SkeletonBlock style={styles.badge} shimmerStyle={shimmerStyle} />
              <SkeletonBlock style={styles.badge} shimmerStyle={shimmerStyle} />
              <SkeletonBlock style={styles.badge} shimmerStyle={shimmerStyle} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  card: {
    borderColor: GlobalStyles.colors.greenDark,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderRadius: 6,
    marginVertical: 8,
    marginHorizontal: 32,
    overflow: 'hidden',
    backgroundColor: GlobalStyles.colors.greenSoft,
    elevation: 5,
    shadowColor: GlobalStyles.colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionsColumn: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    marginTop: 10,
    marginRight: 10,
    gap: 10,
  },
  actionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  content: {
    padding: 12,
    alignItems: 'center',
  },
  title: {
    height: 18,
    width: '65%',
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    height: 14,
    width: '50%',
    borderRadius: 6,
    marginBottom: 12,
  },
  detailsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  detailCell: {
    height: 34,
    width: '40%',
    borderRadius: 6,
  },
  badgesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    width: 68,
    height: 24,
    borderRadius: 10,
  },
  skeletonBase: {
    backgroundColor: GlobalStyles.colors.greenBg,
  },
});

export default JourneysListSkeleton;
