import { ReactElement, useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { ColorScheme, Icons } from '../../models';
import { Indicators, StagesContext } from '../../store/stages-context';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';

interface CurrentElementProps {
  title: string;
  subtitle: string;
  description: string;
  indicator: Indicators;
  colorScheme?: ColorScheme;
  onPress: () => void;
}

const DISMISS_THRESHOLD = 70;

const CurrentElement: React.FC<CurrentElementProps> = ({
  title,
  subtitle,
  description,
  indicator,
  colorScheme = ColorScheme.primary,
  onPress,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);

  let elementStyle = { backgroundColor: GlobalStyles.colors.primary100 };
  if (colorScheme === ColorScheme.complementary) {
    elementStyle = { backgroundColor: GlobalStyles.colors.complementary100 };
  }
  if (colorScheme === ColorScheme.accent) {
    elementStyle = { backgroundColor: GlobalStyles.colors.accent100 };
  }

  // Drag-to-dismiss logic
  function handleClose() {
    stagesCtx.setShownCurrentElementsHandler(indicator, false);
  }

  function handleOpen() {
    stagesCtx.setShownCurrentElementsHandler(indicator, true);
    translateX.value = withTiming(0);
  }

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > DISMISS_THRESHOLD) {
        runOnJS(handleClose)();
        translateX.value = 0;
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.outerContainer}>
      {stagesCtx.shownCurrentElements[indicator] ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.container, elementStyle, animatedStyle]}
            entering={SlideInRight}
            exiting={SlideOutRight}
          >
            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={onPress}
              android_ripple={{ color: GlobalStyles.colors.primary100 }}
            >
              <View style={styles.innerContainer}>
                <Text
                  style={styles.subtitle}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {subtitle}
                </Text>
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {title}
                </Text>
                <Text
                  style={styles.description}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {description}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      ) : (
        <View style={[styles.notShownContainer, elementStyle]}>
          <IconButton
            icon={Icons.arrowLeft}
            onPress={handleOpen}
            size={20}
            color='black'
            containerStyle={styles.icon}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 2,
  },
  container: {
    borderWidth: 1,
    borderRightWidth: 5,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    overflow: 'hidden',
    width: 200,
    height: 75,
  },
  pressed: {
    opacity: 0.75,
  },
  innerContainer: {
    height: '100%',
    width: '100%',
    paddingVertical: 5,
    paddingRight: 10,
    paddingLeft: 30,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notShownContainer: {
    borderWidth: 1,
    borderRightWidth: 5,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    backgroundColor: GlobalStyles.colors.gray50,
    justifyContent: 'center',
    height: 30,
    width: 30,
    alignSelf: 'flex-end',
  },
  icon: {
    margin: 0,
    marginHorizontal: 'auto',
    padding: 0,
  },
});

export default CurrentElement;
