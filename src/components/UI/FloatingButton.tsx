import { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import IconButton from './IconButton';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import { Medium } from '../../models/media';

interface FloatingButtonProps {
  onPress: (media?: Medium[]) => void;
  icon: Icons;
  color?: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  icon,
  color,
}): ReactElement => {
  return (
    <Animated.View style={styles.outerContainer} entering={FadeInUp}>
      <View style={[styles.innerContainer, color && { borderColor: color }]}>
        <IconButton
          icon={icon}
          onPress={onPress}
          size={32}
          color={color ?? GlobalStyles.colors.greenDark}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  innerContainer: {
    borderColor: GlobalStyles.colors.greenDark,
    borderWidth: 1,
    borderRadius: 20,
    elevation: 10,
    backgroundColor: GlobalStyles.colors.greenSoft,
  },
});

export default FloatingButton;
