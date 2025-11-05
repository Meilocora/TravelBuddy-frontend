import { ReactElement, useContext } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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

const DISMISS_THRESHOLD = 40;

const CurrentElement: React.FC<CurrentElementProps> = ({
  title,
  subtitle,
  description,
  indicator,
  colorScheme = ColorScheme.primary,
  onPress,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);

  let elementStyle = { backgroundColor: GlobalStyles.colors.greenBgSemi };
  let rippleColor = GlobalStyles.colors.greenAccent;
  if (colorScheme === ColorScheme.complementary) {
    elementStyle = { backgroundColor: GlobalStyles.colors.purpleBgSemi };
    rippleColor = GlobalStyles.colors.purpleAccent;
  }
  if (colorScheme === ColorScheme.accent) {
    elementStyle = { backgroundColor: GlobalStyles.colors.amberBgSemi };
    rippleColor = GlobalStyles.colors.amberAccent;
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
  const windowWidth = Dimensions.get('window').width;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Nur nach rechts ziehen erlauben; clampen zwischen 0 und windowWidth
      if (event.translationX > 0) {
        translateX.value = Math.min(
          windowWidth,
          Math.max(0, event.translationX)
        );
      }
    })
    .onEnd((event) => {
      const finalTranslation = translateX.value || event.translationX;

      if (finalTranslation > DISMISS_THRESHOLD) {
        // Animiere nach rechts außerhalb des Bildschirms.
        translateX.value = withTiming(
          windowWidth,
          { duration: 300 },
          (isFinished) => {
            if (isFinished) {
              // Auf JS-Thread nach Abschluss der Animation
              runOnJS(handleClose)();
            }
          }
        );
      } else {
        // Zurück in die Ausgangsposition
        translateX.value = withTiming(0, { duration: 200 });
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
              android_ripple={{ color: rippleColor }}
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
            color={GlobalStyles.colors.grayDark}
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
    backgroundColor: GlobalStyles.colors.graySoft,
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
