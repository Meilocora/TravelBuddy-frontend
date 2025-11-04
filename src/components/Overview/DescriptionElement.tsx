import { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

interface DesctipionElementProps {
  description: string;
}

const DesctipionElement: React.FC<DesctipionElementProps> = ({
  description,
}): ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '80%',
    marginHorizontal: 'auto',
    marginBottom: 5,
  },
  text: {
    color: GlobalStyles.colors.amberText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DesctipionElement;
