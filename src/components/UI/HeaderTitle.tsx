import { ReactElement } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import { GlobalStyles } from '../../constants/styles';

interface InfoTextProps {
  title: string;
}

const HeaderTitle: React.FC<InfoTextProps> = ({ title }): ReactElement => {
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode='tail'
      style={[
        styles.title,
        {
          width: Dimensions.get('window').width * 0.6,
        },
      ]}
    >
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    color: GlobalStyles.colors.grayDark,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HeaderTitle;
