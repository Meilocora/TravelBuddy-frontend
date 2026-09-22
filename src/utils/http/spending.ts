import { AxiosResponse } from 'axios';

import { CurrencyInfo, Spending, SpendingFormValues } from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/spending`;

interface ManageSpendingProps {
  spending?: Spending;
  spendingFormValues?: SpendingFormValues;
  backendJourneyId?: number;
  status: number;
  error?: string;
}

export const createSpending = async (
  spendingFormValues: SpendingFormValues,
  minorStageId?: number,
): Promise<ManageSpendingProps> => {
  try {
    const response: AxiosResponse<ManageSpendingProps> = await api.post(
      `${prefix}/create-spending/${minorStageId}`,
      spendingFormValues,
    );

    return {
      spending: response.data.spending,
      backendJourneyId: response.data.backendJourneyId
        ? response.data.backendJourneyId
        : undefined,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageSpendingProps>(
      error,
      'Could not create spending! Backend request failed.',
    );
  }
};

export const updateSpending = async (
  spendingFormValues: SpendingFormValues,
  spendingId: number,
  minorStageId: number,
): Promise<ManageSpendingProps> => {
  try {
    const response: AxiosResponse<ManageSpendingProps> = await api.post(
      `${prefix}/update-spending/${minorStageId}/${spendingId}`,
      spendingFormValues,
    );

    return {
      spending: response.data.spending,
      backendJourneyId: response.data.backendJourneyId
        ? response.data.backendJourneyId
        : undefined,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageSpendingProps>(
      error,
      'Could not update spending! Backend request failed.',
    );
  }
};

export const deleteSpending = async (
  spendingId: number,
): Promise<ManageSpendingProps> => {
  try {
    const response: AxiosResponse<ManageSpendingProps> = await api.delete(
      `${prefix}/delete-spending/${spendingId}`,
    );

    return {
      status: response.status,
      backendJourneyId: response.data.backendJourneyId,
    };
  } catch (error) {
    return handleBackendRequestError<ManageSpendingProps>(
      error,
      'Could not delete spending! Backend request failed.',
    );
  }
};

interface FetchCurrenciesProps {
  currencies?: CurrencyInfo[];
  status: number;
  error?: string;
}

export const fetchCurrencies = async (): Promise<FetchCurrenciesProps> => {
  try {
    const response: AxiosResponse<FetchCurrenciesProps> = await api.get(
      `${prefix}/get-currencies`,
    );

    return {
      status: response.status,
      currencies: response.data.currencies,
    };
  } catch (error) {
    return handleBackendRequestError<FetchCurrenciesProps>(
      error,
      'Could not fetch currencies! Backend request failed.',
    );
  }
};
