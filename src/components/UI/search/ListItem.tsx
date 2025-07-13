import { ReactElement } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { GlobalStyles } from '../../../constants/styles';

interface ListItemProps {
  children: string;
  onPress: (choosenItem: string) => void;
  containerStyles?: ViewStyle;
  textStyles?: TextStyle;
}

const ListItem: React.FC<ListItemProps> = ({
  children,
  onPress,
  containerStyles,
  textStyles,
}): ReactElement => {
  return (
    <Pressable
      onPress={onPress.bind(null, children)}
      style={({ pressed }) => [
        styles.container,
        containerStyles && containerStyles,
        pressed && styles.pressed,
      ]}
      android_ripple={{ color: GlobalStyles.colors.gray100 }}
    >
      <Text style={[styles.text, textStyles && textStyles]} numberOfLines={1}>
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.gray100,
    marginVertical: 5,
  },
  pressed: {
    opacity: 0.5,
  },
  text: {
    fontSize: 20,
    color: GlobalStyles.colors.gray100,
    flexWrap: 'wrap',
  },
});

export default ListItem;
