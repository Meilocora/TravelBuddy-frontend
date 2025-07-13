import React, { ReactElement, useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthContext } from '../../store/auth-context';
import MainHeader from '../../components/UI/MainHeader';
import AuthForm from '../../components/Auth/AuthForm';
import ErrorOverlay from '../../components/UI/ErrorOverlay';

interface AuthScreenProps {}

export interface AuthHandlerProps {
  token?: string;
  refreshToken?: string;
  error?: string;
  status: number;
}

const AuthScreen: React.FC<AuthScreenProps> = (): ReactElement => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authCtx = useContext(AuthContext);

  async function authHandler({
    token,
    refreshToken,
    error,
    status,
  }: AuthHandlerProps) {
    if (error) {
      setError(error);
      return;
    } else if (token && refreshToken && (status === 201 || status === 200)) {
      authCtx.authenticate(token, refreshToken);
    }
  }

  function switchAuthModeHandler() {
    setIsLogin((currValue) => !currValue);
  }

  return (
    <View style={styles.root}>
      {error && (
        <ErrorOverlay
          title='Authentication failed!'
          message={error}
          onPress={() => setError(null)}
        />
      )}
      <ScrollView>
        <MainHeader title='Travelbuddy' />
        <AuthForm
          onAuthenticate={authHandler}
          isLogin={isLogin}
          onSwitchMode={switchAuthModeHandler}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AuthScreen;
