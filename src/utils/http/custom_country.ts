import { AxiosResponse } from 'axios';

import { CustomCountry, CustomCountryFormValues } from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

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
  countryName: string,
): Promise<FetchCountriesResponseProps> => {
  try {
    const response: AxiosResponse<FetchCountriesProps> = await api.get(
      `${prefix}/get-countries/${countryName}`,
    );

    return { items: response.data.countries, status: response.status };
  } catch (error) {
    return handleBackendRequestError<FetchCountriesResponseProps>(
      error,
      'Could not fetch countries!',
    );
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
  countryName: string,
): Promise<AddCustomCountryResponseProps> => {
  try {
    const response: AxiosResponse<AddCustomCountryProps> = await api.post(
      `${prefix}/create-custom-country`,
      { countryName },
    );

    return {
      addedItem: response.data.customCountry,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<AddCustomCountryResponseProps>(
      error,
      'Could not add country!',
    );
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
        `${prefix}/get-custom-countries`,
      );

      return {
        data: response.data.customCountries,
        status: response.status,
      };
    } catch (error) {
      return handleBackendRequestError<FetchCustomCountryResponseProps>(
        error,
        'Could not fetch custom countries!',
      );
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
  customCountryId: number,
): Promise<UpdateCustomCountryProps> => {
  try {
    const response: AxiosResponse<UpdateCustomCountryProps> = await api.post(
      `${prefix}/update-custom-country/${customCountryId}`,
      customCountryFormValues,
    );

    return {
      customCountry: response.data.customCountry,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<UpdateCustomCountryProps>(
      error,
      'Could not update country!',
    );
  }
};

export interface DeleteCustomCountryProps {
  customCountryId?: number;
  status: number;
  countryName?: string;
  error?: string;
}

export const deleteCountry = async (
  customCountryId: number,
): Promise<DeleteCustomCountryProps> => {
  try {
    const response: AxiosResponse<DeleteCustomCountryProps> = await api.delete(
      `${prefix}/delete-custom-country/${customCountryId}`,
    );

    return {
      countryName: response.data.countryName,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<DeleteCustomCountryProps>(
      error,
      'Could not delete country!',
    );
  }
};
