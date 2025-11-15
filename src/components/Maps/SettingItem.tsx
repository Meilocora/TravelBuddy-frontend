import { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import IconButton from '../UI/IconButton';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';

interface SettingItemProps {
  children: any;
  onPress: () => void;
  state: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  children,
  onPress,
  state,
}): ReactElement => {
  return (
    <View style={styles.settingContainer}>
      <Text style={styles.settingText}>{children}</Text>
      <IconButton
        icon={Icons.toggle}
        onPress={onPress}
        style={
          !state ? { transform: [{ scaleX: -1 }], opacity: 0.5 } : undefined
        }
        size={32}
        color={GlobalStyles.colors.graySoft}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  settingContainer: {
    flexDirection: 'row',
    width: '85%',
    marginHorizontal: 'auto',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    color: GlobalStyles.colors.graySoft,
    fontSize: 16,
    marginRight: 6,
  },
});

export default SettingItem;
