import { ReactElement, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { ColorScheme } from '../../models';

interface PopupProps {
  content: string;
  onClose: () => void;
  colorScheme?: ColorScheme;
  duration?: number;
}

const Popup: React.FC<PopupProps> = ({
  content,
  onClose,
  colorScheme = ColorScheme.primary,
  duration = 3000,
}): ReactElement => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  let schemeStyles = primaryStyles;

  if (colorScheme === ColorScheme.accent) {
    schemeStyles = accentStyles;
  } else if (colorScheme === ColorScheme.complementary) {
    schemeStyles = complementaryStyles;
  } else if (colorScheme === ColorScheme.error) {
    schemeStyles = errorStyles;
  } else if (colorScheme === ColorScheme.neutral) {
    schemeStyles = neutralStyles;
  }

  return (
    <Animated.View
      entering={SlideInLeft}
      exiting={SlideOutLeft}
      style={[styles.container, schemeStyles.container]}
    >
      <Pressable onPress={onClose}>
        <Text style={[styles.popupContent, schemeStyles.popupContent]}>
          {content}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    maxWidth: '50%',
    top: 10,
    left: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 5,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderStartWidth: 10,
    borderTopWidth: 2,
    borderEndWidth: 2,
    borderBottomWidth: 2,
    opacity: 0.92,
  },
  popupContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

const neutralStyles = StyleSheet.create({
  container: {
    borderColor: GlobalStyles.colors.grayMedium,
  },
  popupContent: {
    color: GlobalStyles.colors.grayMedium,
  },
});

const primaryStyles = StyleSheet.create({
  container: {
    borderColor: GlobalStyles.colors.greenAccent,
  },
  popupContent: {
    color: GlobalStyles.colors.greenAccent,
  },
});

const accentStyles = StyleSheet.create({
  container: {
    borderColor: GlobalStyles.colors.amberAccent,
  },
  popupContent: {
    color: GlobalStyles.colors.amberAccent,
  },
});

const complementaryStyles = StyleSheet.create({
  container: {
    borderColor: GlobalStyles.colors.purpleAccent,
  },
  popupContent: {
    color: GlobalStyles.colors.purpleAccent,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    borderColor: GlobalStyles.colors.error200,
  },
  popupContent: {
    color: GlobalStyles.colors.error200,
  },
});

export default Popup;
