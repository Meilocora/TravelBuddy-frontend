import { ReactElement } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

interface InfoTextProps {
  content: string;
  style?: TextStyle;
}

const InfoText: React.FC<InfoTextProps> = ({
  content,
  style,
}): ReactElement => {
  return <Text style={[styles.infoText, style]}>{content}</Text>;
};

const styles = StyleSheet.create({
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: GlobalStyles.colors.gray300,
  },
});

export default InfoText;
