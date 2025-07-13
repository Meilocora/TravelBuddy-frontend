import { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlobalStyles } from '../../../constants/styles';

interface InfoPointProps {
  title: string;
  value: string;
  touchable?: boolean;
}

const InfoPoint: React.FC<InfoPointProps> = ({
  title,
  value,
  touchable = false,
}): ReactElement => {
  return (
    <View style={[styles.container, touchable ? styles.touchable : undefined]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: GlobalStyles.colors.gray700,
    marginVertical: 4,
    marginHorizontal: 4,
  },
  touchable: {
    borderColor: GlobalStyles.colors.accent100,
    borderWidth: 1,
  },
  value: {
    fontSize: 16,
    color: GlobalStyles.colors.gray50,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: GlobalStyles.colors.gray300,
  },
});

export default InfoPoint;
