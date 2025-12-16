import { AxiosResponse } from 'axios';
import { CustomCurrencyFormValues } from '../../models';
import api from './api';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/currency`;

export interface ManageCurrencyProps {
  currencyFormValues?: CustomCurrencyFormValues;
  currencyId?: number;
  status: number;
  error?: string;
}

export const addCurrency = async (
  currencyFormValues: CustomCurrencyFormValues
): Promise<ManageCurrencyProps> => {
  try {
    const response: AxiosResponse<ManageCurrencyProps> = await api.post(
      `${prefix}/add-currency`,
      currencyFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not add currency! Backend request failed.',
    };
  }
};

export const updateCurrency = async (
  currencyFormValues: CustomCurrencyFormValues,
  currencyId: number
): Promise<ManageCurrencyProps> => {
  // Only Update Data in backend
  try {
    const response: AxiosResponse<ManageCurrencyProps> = await api.post(
      `${prefix}/update-currency/${currencyId}`,
      currencyFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not update currency! Backend request failed.',
    };
  }
};

export const deleteCurrency = async (
  currencyId: number
): Promise<ManageCurrencyProps> => {
  try {
    const response: AxiosResponse<ManageCurrencyProps> = await api.delete(
      `${prefix}/delete-currency/${currencyId}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not delete currency! Backend request failed.',
    };
  }
};
