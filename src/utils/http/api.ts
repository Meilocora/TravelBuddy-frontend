import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '@env';
import { refreshAuthToken } from './common';

const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem('token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Use Refresh Token to get a new Access Token, then try request again
          const { error, status, newToken, newRefreshToken } =
            await refreshAuthToken(refreshToken!);
          if (!error && newToken && newRefreshToken) {
            AsyncStorage.setItem('token', newToken);
            AsyncStorage.setItem('refreshToken', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            return error;
          }
        } catch (refreshError) {
          // If Refresh Token is invalid, remove tokens from storage (logout)
          AsyncStorage.removeItem('token');
          AsyncStorage.removeItem('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
