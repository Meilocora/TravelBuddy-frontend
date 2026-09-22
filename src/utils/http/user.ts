import { AxiosResponse } from 'axios';

import api from './api';
import { LatLng } from 'react-native-maps';
import { CurrencyInfo } from '../../models';
import { handleBackendRequestError } from './common';

export interface FetchUserDataProps {
  userId?: number;
  offset?: number;
  localCurrency?: CurrencyInfo;
  status: number;
  error?: string;
}

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/user`;

export const fetchUsersData = async (
  currentLocation: LatLng | undefined,
): Promise<FetchUserDataProps> => {
  try {
    const response: AxiosResponse<FetchUserDataProps> = await api.get(
      `${prefix}/get-user-data`,
      {
        params: currentLocation,
      },
    );

    return {
      userId: response.data.userId,
      offset: response.data.offset,
      localCurrency: response.data.localCurrency,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<FetchUserDataProps>(
      error,
      'Could not fetch data! Backend request failed.',
    );
  }
};
