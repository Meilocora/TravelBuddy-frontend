import { memo, ReactElement } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import { GlobalStyles } from '../../../constants/styles';
import { generateRandomString } from '../../../utils';

interface InputProps {
  label: string;
  maxLength: number;
  style?: ViewStyle;
  textInputConfig?: TextInputProps;
  invalid?: boolean;
  errors?: string[];
  isEditing?: boolean;
  mandatory?: boolean;
  customInputStyles?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  maxLength,
  style,
  textInputConfig,
  invalid = false,
  errors,
  isEditing = true,
  mandatory = false,
  customInputStyles,
}): ReactElement => {
  const safeTextInputConfig: TextInputProps = {
    ...(textInputConfig || {}),
    value: textInputConfig?.value ?? '',
  };

  const inputStyles: StyleProp<TextStyle>[] = [styles.input];

  // this boolean is used later to give not multiline inputs tha numberOfLines={1} prop
  const isMultiline = safeTextInputConfig?.multiline || false;

  if (safeTextInputConfig && safeTextInputConfig.multiline) {
    inputStyles.push(styles.inputMultiline);
  }

  if (invalid) {
    inputStyles.push(styles.invalidInput);
  }

  if (
    safeTextInputConfig &&
    (safeTextInputConfig.value === undefined || !safeTextInputConfig.value)
  ) {
    safeTextInputConfig.value = '';
  }

  return (
    <Animated.View style={[styles.inputContainer, style]}>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>
        {label}
        {mandatory && ' *'}
      </Text>
      {isMultiline ? (
        <TextInput
          style={[inputStyles, customInputStyles]}
          editable={!!isEditing}
          autoCorrect={false}
          autoCapitalize='none'
          autoComplete='off'
          {...safeTextInputConfig}
          selectionColor='white'
          underlineColorAndroid='transparent'
          maxLength={maxLength}
        />
      ) : (
        <TextInput
          style={[inputStyles, customInputStyles]}
          editable={!!isEditing}
          autoCorrect={false}
          autoCapitalize='none'
          autoComplete='off'
          numberOfLines={1}
          {...safeTextInputConfig}
          selectionColor='white'
          underlineColorAndroid='transparent'
          maxLength={maxLength}
        />
      )}
      {errors &&
        errors.map((error, index) => (
          <Animated.Text
            style={styles.invalidInfo}
            key={generateRandomString()}
            entering={FadeInUp.duration(500).delay(index * 200)}
            exiting={FadeOut.duration(50)}
          >
            {error.replace(', ', '')}
          </Animated.Text>
        ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: GlobalStyles.colors.gray100,
    marginBottom: 4,
  },
  input: {
    backgroundColor: GlobalStyles.colors.gray300,
    color: GlobalStyles.colors.gray50,
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
    marginVertical: 2,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  invalidLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GlobalStyles.colors.error200,
  },
  invalidInput: {
    backgroundColor: GlobalStyles.colors.error50,
  },
  invalidInfo: {
    color: GlobalStyles.colors.error200,
    fontSize: 14,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
});

// Make sure the compoennt is only reexecuted by the Form, when the errors or editing state change
function areEqual(prevProps: InputProps, nextProps: InputProps): boolean {
  const prevVal = prevProps.textInputConfig?.value;
  const nextVal = nextProps.textInputConfig?.value;

  return (
    prevProps.errors === nextProps.errors &&
    prevProps.isEditing === nextProps.isEditing &&
    prevVal === nextVal
  );
}
export default memo(Input, areEqual);
