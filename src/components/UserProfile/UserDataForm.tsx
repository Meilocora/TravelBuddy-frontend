import { ReactElement, ReactNode, useContext, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import OutsidePressHandler from 'react-native-outside-press';

import { GlobalStyles } from '../../constants/styles';
import {
  ButtonMode,
  ColorScheme,
  Icons,
  NameChangeFormValues,
  PasswordChangeFormValues,
} from '../../models';
import Button from '../UI/Button';
import { AuthContext } from '../../store/auth-context';
import Input from '../UI/form/Input';
import IconButton from '../UI/IconButton';
import ErrorOverlay from '../UI/ErrorOverlay';
import { changePassword, changeUsername } from '../../utils/http';

interface UserDataFormProps {
  setPopupText: (message: string) => void;
  scrollToTop: () => void;
}

const UserDataForm: React.FC<UserDataFormProps> = ({
  setPopupText,
  scrollToTop,
}): ReactElement => {
  const [error, setError] = useState<string | null>();
  const [showNameForm, setShowNameForm] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [nameInputs, setNameInputs] = useState<NameChangeFormValues>({
    newUsername: { value: '', isValid: true, errors: [] },
    password: { value: '', isValid: true, errors: [] },
  });
  const [passwordInputs, setPasswordInputs] =
    useState<PasswordChangeFormValues>({
      newPassword: { value: '', isValid: true, errors: [] },
      confirmPassword: { value: '', isValid: true, errors: [] },
      oldPassword: { value: '', isValid: true, errors: [] },
    });

  const authCtx = useContext(AuthContext);

  function handlePressEditName() {
    setShowNameForm(true);
    setShowPasswordForm(false);
  }

  function handlePressEditPassword() {
    setShowNameForm(false);
    setShowPasswordForm(true);
  }

  function handlePressClose() {
    resetInputs();
    setShowNameForm(false);
    setShowPasswordForm(false);
    setHidePassword(true);
  }
  // TODO: Change password won't work

  function inputChangedHandler(
    formType: 'name' | 'password',
    inputIdentifier: string,
    enteredValue: string
  ) {
    if (formType === 'name') {
      setNameInputs((currInputs) => ({
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] },
      }));
    } else if (formType === 'password') {
      setPasswordInputs((currInputs) => ({
        ...currInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true, errors: [] },
      }));
    }
  }

  // Get screen width and height
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  let content: ReactNode | undefined;

  if (showNameForm) {
    content = (
      <View
        style={[
          styles.blurContainer,
          { width: screenWidth, height: screenHeight * 1.25 },
        ]}
      >
        <OutsidePressHandler
          onOutsidePress={handlePressClose}
          style={styles.outsidePressStyle}
        >
          <Animated.View
            style={styles.formContainer}
            entering={FadeInUp}
            exiting={FadeOutUp}
          >
            <View style={styles.formRow}>
              <Input
                label='New Username'
                maxLength={15}
                invalid={!nameInputs.newUsername.isValid}
                errors={nameInputs.newUsername.errors}
                textInputConfig={{
                  value:
                    nameInputs.newUsername.value === ''
                      ? authCtx.username!
                      : nameInputs.newUsername.value,
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'name',
                    'newUsername'
                  ),
                }}
              />
            </View>
            <View style={styles.formRow}>
              <Input
                label='Password'
                maxLength={40}
                invalid={!nameInputs.password.isValid}
                errors={nameInputs.password.errors}
                textInputConfig={{
                  value: nameInputs.password.value,
                  onChangeText: inputChangedHandler.bind(
                    null,
                    'name',
                    'password'
                  ),
                  secureTextEntry: hidePassword,
                }}
              />
              <IconButton
                icon={hidePassword ? Icons.eyeOff : Icons.eyeOn}
                onPress={() => setHidePassword((prevValue) => !prevValue)}
                style={{ marginTop: 22 }}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                onPress={handlePressClose}
                colorScheme={ColorScheme.neutral}
                mode={ButtonMode.flat}
                style={styles.formButton}
              >
                Cancel
              </Button>
              <Button
                onPress={() => validateInputs('name')}
                colorScheme={ColorScheme.neutral}
                style={styles.formButton}
              >
                Submit
              </Button>
            </View>
          </Animated.View>
        </OutsidePressHandler>
      </View>
    );
  }

  if (showPasswordForm) {
    content = (
      <View
        style={[
          styles.blurContainer,
          { width: screenWidth, height: screenHeight * 1.25 },
        ]}
      >
        <OutsidePressHandler
          onOutsidePress={handlePressClose}
          style={styles.outsidePressStyle}
        >
          <Animated.View
            style={styles.formContainer}
            entering={FadeInUp}
            exiting={FadeOutUp}
          >
            <View style={styles.formRow}>
              <Input
                label='New Password'
                maxLength={40}
                invalid={!passwordInputs.newPassword.isValid}
                errors={passwordInputs.newPassword.errors}
                textInputConfig={{
                  value: passwordInputs.newPassword.value,
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'password',
                    'newPassword'
                  ),
                }}
              />
            </View>
            <View style={styles.formRow}>
              <Input
                label='Confirm New Password'
                maxLength={40}
                invalid={!passwordInputs.confirmPassword.isValid}
                errors={passwordInputs.confirmPassword.errors}
                textInputConfig={{
                  value: passwordInputs.confirmPassword.value,
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'password',
                    'confirmPassword'
                  ),
                }}
              />
            </View>
            <View style={styles.formRow}>
              <Input
                label='Current Password'
                maxLength={40}
                invalid={!passwordInputs.oldPassword.isValid}
                errors={passwordInputs.oldPassword.errors}
                textInputConfig={{
                  value: passwordInputs.oldPassword.value,
                  onChangeText: inputChangedHandler.bind(
                    this,
                    'password',
                    'oldPassword'
                  ),
                  secureTextEntry: hidePassword,
                }}
              />
              <IconButton
                icon={hidePassword ? Icons.eyeOff : Icons.eyeOn}
                onPress={() => setHidePassword((prevValue) => !prevValue)}
                style={{ marginTop: 22 }}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                onPress={handlePressClose}
                colorScheme={ColorScheme.neutral}
                mode={ButtonMode.flat}
                style={styles.formButton}
              >
                Cancel
              </Button>
              <Button
                onPress={() => validateInputs('password')}
                colorScheme={ColorScheme.neutral}
                style={styles.formButton}
              >
                Submit
              </Button>
            </View>
          </Animated.View>
        </OutsidePressHandler>
      </View>
    );
  }

  function resetInputs() {
    setNameInputs({
      newUsername: { value: '', isValid: true, errors: [] },
      password: { value: '', isValid: true, errors: [] },
    });
    setPasswordInputs({
      newPassword: { value: '', isValid: true, errors: [] },
      confirmPassword: { value: '', isValid: true, errors: [] },
      oldPassword: { value: '', isValid: true, errors: [] },
    });
  }

  async function validateInputs(formType: 'name' | 'password'): Promise<void> {
    // Set all errors to empty array to prevent stacking of errors

    if (formType === 'name') {
      for (const key in nameInputs) {
        nameInputs[key as keyof NameChangeFormValues].errors = [];
      }

      const response = await changeUsername(nameInputs);
      const { error, nameFormValues, newUsername } = response!;

      if (!error && newUsername) {
        resetInputs();
        setShowNameForm(false);
        authCtx.setUsername(newUsername);
        setPopupText('Name changed successfully!');
        scrollToTop();
      } else if (error) {
        setError(error);
      } else if (nameFormValues) {
        setNameInputs((prevValues) => nameFormValues);
      }
    } else {
      for (const key in passwordInputs) {
        passwordInputs[key as keyof PasswordChangeFormValues].errors = [];
      }

      const response = await changePassword(passwordInputs);
      const { error, status, passwordFormValues } = response!;

      if (!error && status === 200) {
        resetInputs();
        setShowPasswordForm(false);
        setPopupText('Password changed successfully!');
        scrollToTop();
      } else if (error) {
        setError(error);
      } else if (passwordFormValues) {
        setPasswordInputs((prevValues) => passwordFormValues);
      }
    }
  }

  if (error) {
    return <ErrorOverlay message={error} onPress={() => setError(null)} />;
  }

  return (
    <View style={styles.container}>
      <Button
        colorScheme={ColorScheme.neutral}
        onPress={handlePressEditName}
        style={styles.button}
      >
        Edit Name
      </Button>
      <Button
        colorScheme={ColorScheme.neutral}
        onPress={handlePressEditPassword}
        style={styles.button}
      >
        Edit Password
      </Button>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  button: { alignSelf: 'center' },
  blurContainer: {
    top: -250,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(34, 28, 48, 0.7)',
    alignSelf: 'stretch',
    zIndex: 1,
  },
  outsidePressStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '80%',
    backgroundColor: GlobalStyles.colors.graySoft,
    borderRadius: 20,
    borderWidth: 1,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '85%',
    marginVertical: 4,
    marginHorizontal: 'auto',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  formButton: {
    alignSelf: 'center',
    marginBottom: 15,
  },
});

export default UserDataForm;
