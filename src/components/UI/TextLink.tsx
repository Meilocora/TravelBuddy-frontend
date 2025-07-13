import { ReactElement } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface TextLinkProps {
  link?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: any;
  onPress?: () => void;
}

const TextLink: React.FC<TextLinkProps> = ({
  link,
  style,
  textStyle,
  children,
  onPress,
}): ReactElement => {
  return (
    <View style={[styles.container, style]}>
      {link && (
        <TouchableOpacity
          onPress={() => Linking.openURL(link!)}
          style={{ height: 'auto' }}
        >
          <Text style={[styles.text, textStyle]}>{children}</Text>
        </TouchableOpacity>
      )}
      {onPress && (
        <TouchableOpacity onPress={onPress} style={{ height: 'auto' }}>
          <Text style={[styles.text, textStyle]}>{children}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'blue',
  },
});

export default TextLink;
