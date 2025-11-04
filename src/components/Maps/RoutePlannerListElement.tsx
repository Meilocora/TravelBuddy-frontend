import { ReactElement } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';

interface RoutePlannerListElementProps {
  name: string;
  onPress: () => void;
  onRemove: (name: string) => void;
  onLongPress: () => void;
  subtitle?: string;
  isActive?: boolean;
}

const RoutePlannerListElement: React.FC<RoutePlannerListElementProps> = ({
  name,
  onPress,
  onRemove,
  onLongPress,
  subtitle,
  isActive,
}): ReactElement => {
  return (
    <View style={styles.outerContainer}>
      <Pressable
        style={({ pressed }) => [
          pressed && styles.pressed,
          styles.innerContainer,
        ]}
        onPress={() => onPress()}
        onLongPress={onLongPress}
      >
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text
          style={[styles.name, isActive && styles.active]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </Pressable>
      <IconButton
        icon={Icons.close}
        onPress={() => onRemove(name)}
        color={GlobalStyles.colors.grayDark}
        size={20}
        containerStyle={styles.iconContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingTop: 10,
    flexDirection: 'row',
  },
  innerContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    marginVertical: 2,
  },
  pressed: {
    opacity: 0.5,
  },
  subtitle: {
    position: 'absolute',
    top: -15,
    marginLeft: 10,
    fontSize: 10,
    fontStyle: 'italic',
  },
  name: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    width: 200,
  },
  active: {
    backgroundColor: GlobalStyles.colors.amberBgSemi,
    opacity: 0.7,
  },
  iconContainer: {
    marginVertical: 'auto',
    marginHorizontal: 4,
    padding: 0,
  },
});

export default RoutePlannerListElement;
