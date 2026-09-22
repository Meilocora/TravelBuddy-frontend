import { AxiosResponse } from 'axios';

import {
  MinorStage,
  MinorStageFormValues,
  StagesPositionDict,
} from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

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
  minorStageFormValues: MinorStageFormValues,
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.post(
      `${prefix}/create-minor-stage/${majorStageId}`,
      minorStageFormValues,
    );

    return {
      minorStage: response.data.minorStage,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageMinorStageProps>(
      error,
      'Could not create minor stage! Backend request failed.',
    );
  }
};

export const updateMinorStage = async (
  majorStageId: number,
  minorStageFormValues: MinorStageFormValues,
  minorStageId: number,
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.post(
      `${prefix}/update-minor-stage/${majorStageId}/${minorStageId}`,
      minorStageFormValues,
    );

    return {
      minorStage: response.data.minorStage,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageMinorStageProps>(
      error,
      'Could not update minor stage! Backend request failed.',
    );
  }
};

export const deleteMinorStage = async (
  minorStageId: number,
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.delete(
      `${prefix}/delete-minor-stage/${minorStageId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageMinorStageProps>(
      error,
      'Could not delete minor stage! Backend request failed.',
    );
  }
};

export const swapMinorStages = async (
  stagesPositionList: StagesPositionDict[],
): Promise<ManageMinorStageProps> => {
  try {
    const response: AxiosResponse<ManageMinorStageProps> = await api.post(
      `${prefix}/swap-minor-stages`,
      { stagesPositionList },
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageMinorStageProps>(
      error,
      'Could not swap minor stages! Backend request failed.',
    );
  }
};
