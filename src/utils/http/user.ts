import { AxiosResponse } from 'axios';

import api from './api';
import { LatLng } from 'react-native-maps';
import { CurrencyInfo } from '../../models';

export interface FetchUserDataProps {
  offset?: number;
  localCurrency?: CurrencyInfo;
  status: number;
  error?: string;
}

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/user`;

export const fetchUsersData = async (
  currentLocation: LatLng | undefined
): Promise<FetchUserDataProps> => {
  try {
    const response: AxiosResponse<FetchUserDataProps> = await api.get(
      `${prefix}/get-user-data`,
      {
        params: currentLocation,
      }
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { offset, localCurrency, status } = response.data;

    return { offset, localCurrency, status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not fetch data!' };
  }
};
