import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ReactElement } from 'react';

import { GlobalStyles } from '../../constants/styles';
import { ButtonMode, ColorScheme } from '../../models';
import Button from './Button';

interface ErrorOverlayProps {
  title?: string;
  message: string;
  onPress: () => void;
  buttonText?: string;
}

const DISMISS_THRESHOLD = 100;

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({
  title = 'An Error occurred!',
  message,
  onPress,
  buttonText = 'Close',
}): ReactElement => {
  const [modalVisible, setModalVisible] = useState(true);

  function onClose() {
    onPress();
    setModalVisible(false);
  }

  // Drag-to-dismiss logic
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_THRESHOLD) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          mass: 2,
          damping: 25,
          stiffness: 100,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.innerContainer, animatedStyle]}
        entering={SlideInDown}
        exiting={SlideOutDown}
      >
        <GestureDetector gesture={panGesture}>
          <Text style={[styles.text, styles.title]}>{title}</Text>
        </GestureDetector>
        <ScrollView style={styles.scroll}>
          <Text style={styles.text}>{message}</Text>
        </ScrollView>
        <Button
          mode={ButtonMode.default}
          onPress={onClose}
          colorScheme={ColorScheme.error}
          style={styles.button}
        >
          {buttonText}
        </Button>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  innerContainer: {
    zIndex: 1,
    marginHorizontal: 'auto',
    width: '100%',
    maxHeight: '50%',
    backgroundColor: 'rgba(252, 196, 228, 1)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  scroll: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: GlobalStyles.colors.error500,
    width: '80%',
    marginHorizontal: 'auto',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 12,
    color: GlobalStyles.colors.error500,
  },
  button: {
    marginVertical: 20,
    alignSelf: 'center',
  },
});

export default ErrorOverlay;
