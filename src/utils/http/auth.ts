import axios, { AxiosResponse } from 'axios';

import {
  AuthFormValues,
  NameChangeFormValues,
  PasswordChangeFormValues,
} from '../../models';
import api from './api';

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
  authFormValues: AuthFormValues
): Promise<UserCreationProps> => {
  try {
    const response: AxiosResponse<UserCreationProps> = await axios.post(
      `${prefix}/create-user`,
      authFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.authFormValues) {
      return {
        authFormValues: response.data.authFormValues,
        status: response.data.status,
      };
    }

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      status: response.data.status,
    };
  } catch (error) {
    return {
      status: 500,
      error: 'Could not create user! Backend request failed.',
    };
  }
};

export const loginUser = async (
  authFormValues: AuthFormValues
): Promise<UserCreationProps> => {
  try {
    const response: AxiosResponse<UserCreationProps> = await axios.post(
      `${prefix}/login-user`,
      authFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.authFormValues) {
      return {
        authFormValues: response.data.authFormValues,
        status: response.data.status,
      };
    }

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      status: response.data.status,
    };
  } catch (error) {
    return {
      status: 500,
      error: 'Could not login user! Backend request failed.',
    };
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
      `${prefix}/get-user-infos`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { username, email, status } = response.data;

    return { username, email, status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not fetch data! Backend request failed.',
    };
  }
};

interface NameChangeProps {
  status: number;
  error?: string;
  nameFormValues?: NameChangeFormValues;
  newUsername?: string;
}

export const changeUsername = async (
  nameFormValues: NameChangeFormValues
): Promise<NameChangeProps> => {
  try {
    const response: AxiosResponse<NameChangeProps> = await api.post(
      `${prefix}/change-username`,
      nameFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.nameFormValues) {
      return {
        nameFormValues: response.data.nameFormValues,
        status: response.data.status,
      };
    }

    return {
      newUsername: response.data.newUsername,
      status: response.data.status,
    };
  } catch (error) {
    return {
      status: 500,
      error: 'Could not change username! Backend request failed.',
    };
  }
};

interface PasswordChangeProps {
  status: number;
  error?: string;
  passwordFormValues?: PasswordChangeFormValues;
}

export const changePassword = async (
  passwordFormValues: PasswordChangeFormValues
): Promise<PasswordChangeProps> => {
  try {
    const response: AxiosResponse<PasswordChangeProps> = await api.post(
      `${prefix}/change-password`,
      passwordFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.passwordFormValues) {
      return {
        passwordFormValues: response.data.passwordFormValues,
        status: response.data.status,
      };
    }

    return {
      status: response.data.status,
    };
  } catch (error) {
    return {
      status: 500,
      error: 'Could not change password! Backend request failed.',
    };
  }
};
