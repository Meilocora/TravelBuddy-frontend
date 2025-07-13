import { ReactElement } from 'react';
import { Text, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { GlobalStyles } from '../../constants/styles';

interface MainHeaderProps {
  title: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  containerStyle,
  titleStyle,
}): ReactElement => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GlobalStyles.colors.gray50,
    letterSpacing: 2.5,
  },
});

export default MainHeader;
