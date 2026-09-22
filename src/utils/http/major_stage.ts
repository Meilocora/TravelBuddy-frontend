import { AxiosResponse } from 'axios';

import {
  MajorStage,
  MajorStageFormValues,
  StagesPositionDict,
} from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/major_stage`;

interface ManageMajorStageProps {
  majorStage?: MajorStage;
  majorStageFormValues?: MajorStageFormValues;
  status: number;
  error?: string;
}

export const createMajorStage = async (
  journeyId: number,
  majorStageFormValues: MajorStageFormValues,
): Promise<ManageMajorStageProps> => {
  try {
    const response: AxiosResponse<ManageMajorStageProps> = await api.post(
      `${prefix}/create-major-stage/${journeyId}`,
      majorStageFormValues,
    );

    return {
      majorStage: response.data.majorStage,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageMajorStageProps>(
      error,
      'Could not create major stage! Backend request failed.',
    );
  }
};

export const updateMajorStage = async (
  journeyId: number,
  majorStageFormValues: MajorStageFormValues,
  majorStageId: number,
): Promise<ManageMajorStageProps> => {
  try {
    const response: AxiosResponse<ManageMajorStageProps> = await api.post(
      `${prefix}/update-major-stage/${journeyId}/${majorStageId}`,
      majorStageFormValues,
    );

    return {
      majorStage: response.data.majorStage,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageMajorStageProps>(
      error,
      'Could not update major stage! Backend request failed.',
    );
  }
};

export const deleteMajorStage = async (
  majorStageId: number,
): Promise<ManageMajorStageProps> => {
  try {
    const response: AxiosResponse<ManageMajorStageProps> = await api.delete(
      `${prefix}/delete-major-stage/${majorStageId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageMajorStageProps>(
      error,
      'Could not delete major stage! Backend request failed.',
    );
  }
};

export const swapMajorStages = async (
  stagesPositionList: StagesPositionDict[],
): Promise<ManageMajorStageProps> => {
  try {
    const response: AxiosResponse<ManageMajorStageProps> = await api.post(
      `${prefix}/swap-major-stages`,
      { stagesPositionList },
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageMajorStageProps>(
      error,
      'Could not swap major stages! Backend request failed.',
    );
  }
};
