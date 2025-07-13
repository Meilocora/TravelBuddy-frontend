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
    color: 'white',
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
    backgroundColor: GlobalStyles.colors.gray700,
  },
  flatText: {
    color: GlobalStyles.colors.gray50,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.gray500,
  },
});

const primaryStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.primary500,
  },
  flatText: {
    color: GlobalStyles.colors.primary400,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.primary100,
  },
});

const accentStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.accent500,
  },
  flatText: {
    color: GlobalStyles.colors.accent800,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.accent100,
  },
});

const complementaryStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.complementary500,
  },
  flatText: {
    color: GlobalStyles.colors.complementary800,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.complementary100,
  },
});

const errorStyles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.error500,
  },
  flatText: {
    color: GlobalStyles.colors.error500,
  },
  pressed: {
    backgroundColor: GlobalStyles.colors.error50,
  },
});

export default Button;
