import React, { ReactElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import {
  AuthFormValues,
  ButtonMode,
  ColorScheme,
  Icons,
  StackParamList,
} from '../../models';
import FormShell from '../UI/form/FormShell';
import Button from '../UI/Button';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Input from '../UI/form/Input';
import IconButton from '../UI/IconButton';
import { createUser, loginUser } from '../../utils/http';
import { AuthHandlerProps } from '../../screens/Auth/AuthScreen';

type CredentialValidationResponse = {
  token?: string;
  refreshToken?: string;
  authFormValues?: AuthFormValues;
  error?: string;
  status: number;
};

interface AuthFormProps {
  isLogin: boolean;
  onSwitchMode: () => void;
  onAuthenticate: ({
    token,
    refreshToken,
    error,
    status,
  }: AuthHandlerProps) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  onSwitchMode,
  onAuthenticate,
}): ReactElement => {
  const [hidePassword, setHidePassword] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [credentials, setCredentials] = useState<AuthFormValues>({
    email: { value: '', isValid: true, errors: [] },
    username: { value: '', isValid: true, errors: [] },
    password: { value: '', isValid: true, errors: [] },
  });

  let submitButtonLabel = 'Login';
  if (!isLogin) {
    submitButtonLabel = 'SignUp';
  }

  if (isAuthenticating && isLogin) {
    submitButtonLabel = 'Logging in...';
  } else if (isAuthenticating && !isLogin) {
    submitButtonLabel = 'Signing up...';
  }

  function handlePressIcon() {
    setHidePassword((currHidePassword) => !currHidePassword);
    // trigger rerender of password input to show/hide password
    setCredentials((currCredentials) => {
      return {
        ...currCredentials,
        password: { ...currCredentials.password, isValid: true, errors: [] },
      };
    });
  }

  async function validateInputs(): Promise<void> {
    // Set all errors to empty array to prevent stacking of errors
    setIsAuthenticating(true);
    for (const key in credentials) {
      credentials[key as keyof AuthFormValues].errors = [];
    }

    let response: CredentialValidationResponse;
    if (isLogin) {
      response = await loginUser(credentials);
    } else if (!isLogin) {
      response = await createUser(credentials);
    }

    const { error, status, token, refreshToken, authFormValues } = response!;

    if (!error && token) {
      onAuthenticate({ token, refreshToken, status });
    } else if (error) {
      onAuthenticate({ error, status });
    } else if (authFormValues) {
      setCredentials((prevValues) => authFormValues);
    }
    setIsAuthenticating(false);
    return;
  }

  function onSwitchHandler() {
    setCredentials({
      email: { value: '', isValid: true, errors: [] },
      username: { value: '', isValid: true, errors: [] },
      password: { value: '', isValid: true, errors: [] },
    });
    onSwitchMode();
  }

  function inputChangedHandler(inputIdentifier: string, enteredValue: string) {
    setCredentials((currCredentials) => {
      return {
        ...currCredentials,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] }, // dynamically use propertynames for objects
      };
    });
  }

  let formContent = (
    <View>
      <View style={styles.formRow}>
        <Input
          label='E-Mail'
          maxLength={100}
          invalid={!credentials.email.isValid}
          errors={credentials.email.errors}
          textInputConfig={{
            value: credentials.email.value,
            onChangeText: inputChangedHandler.bind(null, 'email'),
          }}
        />
      </View>
      <View style={styles.formRow}>
        <Input
          label='Password'
          maxLength={100}
          invalid={!credentials.password.isValid}
          errors={credentials.password.errors}
          textInputConfig={{
            value: credentials.password.value,
            onChangeText: inputChangedHandler.bind(null, 'password'),
            secureTextEntry: hidePassword,
          }}
        />
        <IconButton
          icon={hidePassword ? Icons.eyeOff : Icons.eyeOn}
          onPress={handlePressIcon}
          style={{ marginTop: 22 }}
        />
      </View>
    </View>
  );

  if (!isLogin) {
    formContent = (
      <>
        <View style={styles.formRow}>
          <Input
            label='Username'
            maxLength={100}
            invalid={!credentials.username.isValid}
            errors={credentials.username.errors}
            textInputConfig={{
              value: credentials.username.value,
              onChangeText: inputChangedHandler.bind(null, 'username'),
            }}
          />
        </View>
        {formContent}
      </>
    );
  }

  return (
    <Animated.View style={styles.container} layout={FadeInUp.duration(300)}>
      <FormShell title={isLogin ? 'Login' : 'SignUp'}>
        {formContent}
        <View style={styles.buttonsContainer}>
          <Button
            onPress={onSwitchHandler}
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
          >
            {isLogin ? 'Switch to SignUp' : 'Switch to Login'}
          </Button>
          <Button onPress={validateInputs} colorScheme={ColorScheme.neutral}>
            {isLogin ? 'Login' : 'SignUp'}
          </Button>
        </View>
      </FormShell>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 84,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '85%',
    marginVertical: 4,
    marginHorizontal: 'auto',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '80%',
    marginVertical: 8,
    marginHorizontal: 'auto',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});

export default AuthForm;
