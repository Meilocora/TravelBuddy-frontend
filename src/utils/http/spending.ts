import { AxiosResponse } from 'axios';

import { CurrencyInfo, Spending, SpendingFormValues } from '../../models';
import api from './api';

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
  minorStageId?: number
): Promise<ManageSpendingProps> => {
  try {
    const response: AxiosResponse<ManageSpendingProps> = await api.post(
      `${prefix}/create-spending/${minorStageId}`,
      spendingFormValues
    );

    // Error from backend
    if (response!.data.error) {
      return { status: response!.data.status, error: response!.data.error };
    }

    if (response!.data.spendingFormValues) {
      return {
        spendingFormValues: response!.data.spendingFormValues,
        status: response!.data.status,
      };
    }

    return {
      spending: response!.data.spending,
      backendJourneyId: response!.data.backendJourneyId
        ? response!.data.backendJourneyId
        : undefined,
      status: response!.data.status,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not create spending!' };
  }
};

export const updateSpending = async (
  spendingFormValues: SpendingFormValues,
  spendingId: number,
  minorStageId: number
): Promise<ManageSpendingProps> => {
  try {
    const response: AxiosResponse<ManageSpendingProps> = await api.post(
      `${prefix}/update-spending/${minorStageId}/${spendingId}`,
      spendingFormValues
    );

    // Error from backend
    if (response!.data.error) {
      return { status: response!.data.status, error: response!.data.error };
    }

    if (response!.data.spendingFormValues) {
      return {
        spendingFormValues: response!.data.spendingFormValues,
        status: response!.data.status,
      };
    }

    return {
      spending: response!.data.spending,
      backendJourneyId: response!.data.backendJourneyId
        ? response!.data.backendJourneyId
        : undefined,
      status: response!.data.status,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not update spending!' };
  }
};

export const deleteSpending = async (
  spendingId: number
): Promise<ManageSpendingProps> => {
  try {
    const response: AxiosResponse<ManageSpendingProps> = await api.delete(
      `${prefix}/delete-spending/${spendingId}`
    );

    // Error from backend
    if (response!.data.error) {
      return { status: response!.data.status, error: response!.data.error };
    }

    return {
      status: response!.data.status,
      backendJourneyId: response!.data.backendJourneyId,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not delete spending!' };
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
      `${prefix}/get-currencies`
    );

    // Error from backend
    if (response!.data.error) {
      return { status: response!.data.status, error: response!.data.error };
    }

    return {
      status: response!.data.status,
      currencies: response!.data.currencies,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not fetch currencies!' };
  }
};
