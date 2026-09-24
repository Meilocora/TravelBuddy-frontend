import { ReactElement, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { GlobalStyles } from '../../constants/styles';

interface ModalProps {
  content?: string;
  containerStyle?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({
  content = 'Saving data',
  containerStyle,
}): ReactElement => {
  const [dotsCount, setDotsCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotsCount((prevDots) => (prevDots + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.blurcontainer}></View>
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={[styles.container, containerStyle]}
      >
        <View style={styles.contentRow}>
          <Text style={styles.content}>{content}</Text>
          <Text style={styles.dots}>{'.'.repeat(dotsCount)}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  blurcontainer: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.graySoft,
    opacity: 0.4,
  },
  container: {
    position: 'absolute',
    opacity: 1,
    marginHorizontal: 'auto',
    marginTop: '70%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 24,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: GlobalStyles.colors.grayMedium,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    fontSize: 18,
    color: GlobalStyles.colors.grayMedium,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  dots: {
    width: 24,
    fontSize: 18,
    color: GlobalStyles.colors.grayMedium,
    textAlign: 'left',
  },
});

export default Modal;
