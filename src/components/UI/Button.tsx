import { ReactElement } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import { ButtonMode, ColorScheme } from '../../models';

interface ButtonProps {
  children: string;
  onPress: () => void;
  mode?: ButtonMode;
  colorScheme: ColorScheme;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  style,
  mode = ButtonMode.default,
  colorScheme,
  textStyle,
}): ReactElement => {
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
    <View style={[generalStyles.container, style && style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && [generalStyles.pressed, schemeStyles.pressed],
        ]}
      >
        <View
          style={[
            generalStyles.button,
            schemeStyles.button,
            mode === 'flat' && generalStyles.flat,
          ]}
        >
          <Text
            style={[
              generalStyles.buttonText,
              schemeStyles.buttonText,
              mode === 'flat' && schemeStyles.flatText,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const generalStyles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  button: {
    borderRadius: 4,
    padding: 4,
  },
  flat: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.75,
    borderRadius: 4,
  },
});

const neutralStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.grayDark,
  },
  buttonText: {
    color: GlobalStyles.colors.graySoft,
  },
  flatText: {
    color: GlobalStyles.colors.grayDark,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.grayMedium,
  },
});

const primaryStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.greenAccent,
  },
  buttonText: {
    color: GlobalStyles.colors.greenSoft,
  },
  flatText: {
    color: GlobalStyles.colors.greenAccent,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.greenBg,
  },
});

const accentStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.amberAccent,
  },
  buttonText: {
    color: GlobalStyles.colors.amberSoft,
  },
  flatText: {
    color: GlobalStyles.colors.amberAccent,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.amberBg,
  },
});

const complementaryStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.purpleAccent,
  },
  buttonText: {
    color: GlobalStyles.colors.purpleSoft,
  },
  flatText: {
    color: GlobalStyles.colors.purpleAccent,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.purpleBg,
  },
});

const errorStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.error500,
  },
  buttonText: {
    color: 'white',
  },
  flatText: {
    color: GlobalStyles.colors.error500,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.error50,
  },
});

export default Button;
