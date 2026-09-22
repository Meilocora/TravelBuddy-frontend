import axios, { AxiosResponse } from 'axios';

import {
  AuthFormValues,
  NameChangeFormValues,
  PasswordChangeFormValues,
} from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/auth`;

interface UserCreationProps {
  status: number;
  error?: string;
  authFormValues?: AuthFormValues;
  token?: string;
  refreshToken?: string;
}

export const createUser = async (
  authFormValues: AuthFormValues,
): Promise<UserCreationProps> => {
  try {
    const response: AxiosResponse<UserCreationProps> = await axios.post(
      `${prefix}/create-user`,
      authFormValues,
    );

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<UserCreationProps>(
      error,
      'Could not create user! Backend request failed.',
    );
  }
};

export const loginUser = async (
  authFormValues: AuthFormValues,
): Promise<UserCreationProps> => {
  try {
    const response: AxiosResponse<UserCreationProps> = await axios.post(
      `${prefix}/login-user`,
      authFormValues,
    );

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<UserCreationProps>(
      error,
      'Could not login user! Backend request failed.',
    );
  }
};

interface FetchUserInfosProps {
  username?: string;
  email?: string;
  status: number;
  error?: string;
}

export const fetchUserInfos = async (): Promise<FetchUserInfosProps> => {
  try {
    const response: AxiosResponse<FetchUserInfosProps> = await api.get(
      `${prefix}/get-user-infos`,
    );

    const { username, email, status } = response.data;

    return { username, email, status };
  } catch (error) {
    return handleBackendRequestError<FetchUserInfosProps>(
      error,
      'Could not fetch data! Backend request failed.',
    );
  }
};

interface NameChangeProps {
  status: number;
  error?: string;
  nameFormValues?: NameChangeFormValues;
  newUsername?: string;
}

export const changeUsername = async (
  nameFormValues: NameChangeFormValues,
): Promise<NameChangeProps> => {
  try {
    const response: AxiosResponse<NameChangeProps> = await api.post(
      `${prefix}/change-username`,
      nameFormValues,
    );

    return {
      newUsername: response.data.newUsername,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<NameChangeProps>(
      error,
      'Could not change username! Backend request failed.',
    );
  }
};

interface PasswordChangeProps {
  status: number;
  error?: string;
  passwordFormValues?: PasswordChangeFormValues;
}

export const changePassword = async (
  passwordFormValues: PasswordChangeFormValues,
): Promise<PasswordChangeProps> => {
  try {
    const response: AxiosResponse<PasswordChangeProps> = await api.post(
      `${prefix}/change-password`,
      passwordFormValues,
    );

    return {
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<PasswordChangeProps>(
      error,
      'Could not change password! Backend request failed.',
    );
  }
};
