import { ReactElement, useState } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { GlobalStyles } from '../../constants/styles';
import { ColorScheme } from '../../models';

interface InfoCurtainProps {
  info: string;
  colorScheme?: ColorScheme;
}

const InfoCurtain: React.FC<InfoCurtainProps> = ({
  info,
  colorScheme = ColorScheme.primary,
}): ReactElement => {
  const [showInfo, setShowInfo] = useState(true);

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
    <>
      {showInfo && (
        <Animated.View entering={SlideInUp} exiting={SlideOutUp.duration(200)}>
          <Pressable
            style={[styles.container, schemeStyles.container]}
            onPress={() => setShowInfo(!showInfo)}
          >
            <Text style={[styles.text, schemeStyles.text]}>{info}</Text>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    borderBottomRightRadius: 70,
    borderBottomLeftRadius: 70,
    margin: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

const neutralStyles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.gray100,
  },
  text: {
    color: GlobalStyles.colors.gray700,
  },
});

const primaryStyles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.primary100,
  },
  text: {
    color: GlobalStyles.colors.primary800,
  },
});

const accentStyles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.accent100,
  },
  text: {
    color: GlobalStyles.colors.accent800,
  },
});

const complementaryStyles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.complementary100,
  },
  text: {
    color: GlobalStyles.colors.complementary800,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.error500,
  },
  text: {
    color: GlobalStyles.colors.error50,
  },
});

export default InfoCurtain;
