import { ReactElement } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';

import TextLink from '../TextLink';
import { Icons } from '../../../models';
import IconButton from '../IconButton';
import { GlobalStyles } from '../../../constants/styles';

interface ElementDetailProps {
  title?: string;
  icon?: Icons;
  value: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  link?: string;
  onPress?: () => void;
}

const ElementDetail = ({
  title,
  icon,
  value,
  style,
  textStyle,
  link,
  onPress,
}: ElementDetailProps): ReactElement => {
  return (
    <View style={[styles.container, style]}>
      {title ? (
        <Text style={[styles.title]} numberOfLines={1}>
          {title}
        </Text>
      ) : icon ? (
        <IconButton
          icon={icon}
          onPress={() => {}}
          color={GlobalStyles.colors.grayMedium}
          containerStyle={styles.icon}
        />
      ) : undefined}
      {!link && (
        <Pressable onPress={onPress}>
          <Text style={textStyle} numberOfLines={1}>
            {value}
          </Text>
        </Pressable>
      )}
      {link && (
        <TextLink link={link} textStyle={textStyle}>
          {value}
        </TextLink>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 4,
    paddingVertical: 4,
    minWidth: 100,
    borderWidth: 0.75,
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: GlobalStyles.colors.grayMedium,
  },
  icon: {
    marginVertical: 0,
    paddingVertical: 0,
  },
});

export default ElementDetail;
