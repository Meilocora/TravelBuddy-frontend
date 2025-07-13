import { AxiosResponse } from 'axios';

import { BACKEND_URL } from '@env';
import api from './api';
import { LatLng } from 'react-native-maps';

export interface FetchUserDataProps {
  offset?: number;
  localCurrency?: string;
  conversionRate?: number;
  status: number;
  error?: string;
}

const prefix = `${BACKEND_URL}/user`;

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

    const { offset, localCurrency, conversionRate, status } = response.data;

    return { offset, localCurrency, conversionRate, status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not fetch data!' };
  }
};
