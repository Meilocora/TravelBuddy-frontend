import { AxiosResponse } from 'axios';

import { CustomCountry, CustomCountryFormValues } from '../../models';
import api from './api';

export interface FetchCountriesProps {
  countries?: string[];
  status: number;
  error?: string;
}

export interface FetchCountriesResponseProps {
  items?: string[];
  status: number;
  error?: string;
}

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/country`;

export const fetchCountries = async (
  countryName: string
): Promise<FetchCountriesResponseProps> => {
  try {
    const response: AxiosResponse<FetchCountriesProps> = await api.get(
      `${prefix}/get-countries/${countryName}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { countries, status } = response.data;

    if (!countries) {
      return { status };
    }

    return { items: countries, status: status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not fetch countries!' };
  }
};

export interface AddCustomCountryProps {
  customCountry?: CustomCountry;
  status: number;
  error?: string;
}

export interface AddCustomCountryResponseProps {
  addedItem?: CustomCountry;
  status: number;
  error?: string;
}

export const addCountry = async (
  countryName: string
): Promise<AddCustomCountryResponseProps> => {
  try {
    const response: AxiosResponse<AddCustomCountryProps> = await api.post(
      `${prefix}/create-custom-country`,
      { countryName }
    );

    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return {
      addedItem: response.data.customCountry,
      status: response.data.status,
    };
  } catch (error) {
    return { status: 500, error: 'Could not add country!' };
  }
};

export interface FetchCustomCountryProps {
  customCountries?: CustomCountry[];
  status: number;
  error?: string;
}

export interface FetchCustomCountryResponseProps {
  data?: CustomCountry[];
  journeyId?: number;
  status: number;
  error?: string;
}

export const fetchCustomCountries =
  async (): Promise<FetchCustomCountryResponseProps> => {
    try {
      const response: AxiosResponse<FetchCustomCountryProps> = await api.get(
        `${prefix}/get-custom-countries`
      );

      if (response.data.error) {
        return { status: response.data.status, error: response.data.error };
      }

      return {
        data: response.data.customCountries,
        status: response.data.status,
      };
    } catch (error) {
      return { status: 500, error: 'Could not fetch custom countries!' };
    }
  };

export interface UpdateCustomCountryProps {
  customCountryFormValues?: CustomCountryFormValues;
  customCountryId?: number;
  customCountry?: CustomCountry;
  status: number;
  error?: string;
}

export const updateCountry = async (
  customCountryFormValues: CustomCountryFormValues,
  customCountryId: number
): Promise<UpdateCustomCountryProps> => {
  try {
    const response: AxiosResponse<UpdateCustomCountryProps> = await api.post(
      `${prefix}/update-custom-country/${customCountryId}`,
      customCountryFormValues
    );

    if (response.data.customCountryFormValues) {
      return {
        customCountryFormValues: response.data.customCountryFormValues,
        status: response.data.status,
      };
    }

    return {
      customCountry: response.data.customCountry,
      status: response.data.status,
    };
  } catch (error) {
    return { status: 500, error: 'Could not update country!' };
  }
};

export interface DeleteCustomCountryProps {
  customCountryId?: number;
  status: number;
  countryName?: string;
  error?: string;
}

export const deleteCountry = async (
  customCountryId: number
): Promise<DeleteCustomCountryProps> => {
  try {
    const response: AxiosResponse<DeleteCustomCountryProps> = await api.delete(
      `${prefix}/delete-custom-country/${customCountryId}`
    );

    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return {
      countryName: response.data.countryName,
      status: response.data.status,
    };
  } catch (error) {
    return { status: 500, error: 'Could not delete country!' };
  }
};
