import { ReactElement } from 'react';
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Icons } from '../../models';

interface LinkProps {
  link: string;
  icon?: Icons;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const Link: React.FC<LinkProps> = ({
  link,
  icon = Icons.linkOutline,
  size = 24,
  color = 'blue',
  style,
}): ReactElement => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={() => Linking.openURL(link)}>
        <Ionicons name={icon} size={size} color={color} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Link;
