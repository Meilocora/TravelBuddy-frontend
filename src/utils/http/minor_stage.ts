import { AxiosResponse } from 'axios';

import { MinorStage, MinorStageFormValues } from '../../models';
import api from './api';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/minor_stage`;

interface ManageMinorStageProps {
  minorStage?: MinorStage;
  minorStageFormValues?: MinorStageFormValues;
  status: number;
  error?: string;
}

export const createMinorStage = async (
  majorStageId: number,
  minorStageFormValues: MinorStageFormValues
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.post(
      `${prefix}/create-minor-stage/${majorStageId}`,
      minorStageFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.minorStageFormValues) {
      return {
        minorStageFormValues: response.data.minorStageFormValues,
        status: response.data.status,
      };
    }

    return {
      minorStage: response.data.minorStage,
      status: response.data.status,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not create minor stage!' };
  }
};

export const updateMinorStage = async (
  majorStageId: number,
  minorStageFormValues: MinorStageFormValues,
  minorStageId: number
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.post(
      `${prefix}/update-minor-stage/${majorStageId}/${minorStageId}`,
      minorStageFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.minorStageFormValues) {
      return {
        minorStageFormValues: response.data.minorStageFormValues,
        status: response.data.status,
      };
    }

    return {
      minorStage: response.data.minorStage,
      status: response.data.status,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not update minor stage!' };
  }
};

export const deleteMinorStage = async (
  minorStageId: number
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.delete(
      `${prefix}/delete-minor-stage/${minorStageId}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not delete minor stage!' };
  }
};
