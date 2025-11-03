import { ReactElement } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GlobalStyles } from '../../constants/styles';

import IconButton from './IconButton';
import { Icons } from '../../models';

interface TagCloudProps {
  text: string;
  onPress: (text: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ text, onPress }): ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <IconButton
        icon={Icons.close}
        onPress={() => onPress(text)}
        size={14}
        containerStyle={styles.closeStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GlobalStyles.colors.grayMedium,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.greenAccent,
  },
  closeStyle: {
    marginHorizontal: 1,
    padding: 0,
  },
  text: {
    fontWeight: 'bold',
    color: GlobalStyles.colors.greenSoft,
  },
});

export default TagCloud;
