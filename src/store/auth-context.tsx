import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { fetchUserInfos, refreshAuthToken } from '../utils/http';

interface AuthContextType {
  fetchUserInfo: () => Promise<void | string>;
  username: string | null;
  setUsername: (name: string) => void;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  authenticate: (token: string, refreshToken: string) => void;
  logout: () => void;
  useRefreshToken: (refreshToken: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  fetchUserInfo: async () => {},
  username: null,
  setUsername: (name) => {},
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  authenticate: (token, refreshToken) => {},
  logout: () => {},
  useRefreshToken: (refreshToken) => {},
});

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      if (storedToken) {
        const decodedToken = JSON.parse(
          Buffer.from(storedToken.split('.')[1], 'base64').toString()
        );
        if (decodedToken.exp * 1000 > Date.now()) {
          setAuthToken(storedToken);
          setRefreshToken(storedRefreshToken);
        } else {
          const { error, status, newToken, newRefreshToken } =
            await refreshAuthToken(storedRefreshToken!);
          if (!error && newToken && newRefreshToken) {
            setAuthToken(newToken);
            setRefreshToken(newRefreshToken);
            AsyncStorage.setItem('token', newToken);
            AsyncStorage.setItem('refreshToken', newRefreshToken);
          } else {
            return;
          }
        }
      }
    };
    loadToken();
  }, []);

  function authenticate(token: string, refreshToken: string) {
    const decodedToken = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );

    if (decodedToken.exp * 1000 > Date.now()) {
      setAuthToken(token);
      setRefreshToken(refreshToken);
      AsyncStorage.setItem('token', token);
      AsyncStorage.setItem('refreshToken', refreshToken!);
    } else {
      return;
    }
  }

  function logout() {
    setAuthToken(null);
    setRefreshToken(null);
    setUsername(null);
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('refreshToken');
  }

  async function useRefreshToken(refreshToken: string) {
    const { error, status, newToken, newRefreshToken } = await refreshAuthToken(
      refreshToken!
    );
    if (!error && newToken && newRefreshToken) {
      setAuthToken(newToken);
      setRefreshToken(newRefreshToken);
      AsyncStorage.setItem('token', newToken);
      AsyncStorage.setItem('refreshToken', newRefreshToken);
    } else {
      return error;
    }
  }

  async function fetchUserInfo() {
    const response = await fetchUserInfos();
    if (!response.error) {
      setUsername(response.username!);
      setEmail(response.email!);
    } else {
      return response.error;
    }
  }

  const value = {
    fetchUserInfo,
    username,
    setUsername,
    token: authToken,
    refreshToken: refreshToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
    useRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
