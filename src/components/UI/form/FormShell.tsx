import { ReactElement } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';

interface FormShellProps {
  title: string;
  children: React.ReactNode;
}

const FormShell: React.FC<FormShellProps> = ({
  title,
  children,
}): ReactElement => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>{title}</Text>
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    opacity: 0.75,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 45,
    borderColor: GlobalStyles.colors.gray100,
    backgroundColor: GlobalStyles.colors.gray400,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    color: GlobalStyles.colors.gray50,
    fontWeight: 'bold',
  },
});

export default FormShell;
