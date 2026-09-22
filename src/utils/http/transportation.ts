import { AxiosResponse } from 'axios';

import { Transportation, TransportationFormValues } from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/transportation`;

interface ManageTransportProps {
  transportation?: Transportation;
  transportationFormValues?: TransportationFormValues;
  backendMajorStageId?: number;
  status: number;
  error?: string;
}

export const createTransportation = async (
  transportationFormValues: TransportationFormValues,
  majorStageId?: number,
  minorStageId?: number,
): Promise<ManageTransportProps> => {
  try {
    let response: AxiosResponse<ManageTransportProps>;
    if (majorStageId) {
      response = await api.post(
        `${prefix}/create-major-stage-transportation/${majorStageId}`,
        transportationFormValues,
      );
    } else if (minorStageId) {
      response = await api.post(
        `${prefix}/create-minor-stage-transportation/${minorStageId}`,
        transportationFormValues,
      );
    }

    return {
      transportation: response!.data.transportation,
      backendMajorStageId: response!.data.backendMajorStageId
        ? response!.data.backendMajorStageId
        : undefined,
      status: response!.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageTransportProps>(
      error,
      'Could not create transportation! Backend request failed.',
    );
  }
};

export const updateTransportation = async (
  transportationFormValues: TransportationFormValues,
  transportationId: number,
  majorStageId?: number,
  minorStageId?: number,
): Promise<ManageTransportProps> => {
  try {
    let response: AxiosResponse<ManageTransportProps>;
    if (majorStageId) {
      response = await api.post(
        `${prefix}/update-major-stage-transportation/${majorStageId}/${transportationId}`,
        transportationFormValues,
      );
    } else if (minorStageId) {
      response = await api.post(
        `${prefix}/update-minor-stage-transportation/${minorStageId}/${transportationId}`,
        transportationFormValues,
      );
    }

    return {
      transportation: response!.data.transportation,
      backendMajorStageId: response!.data.backendMajorStageId
        ? response!.data.backendMajorStageId
        : undefined,
      status: response!.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageTransportProps>(
      error,
      'Could not update transportation! Backend request failed.',
    );
  }
};

export const deleteTransportation = async (
  majorStageId?: number,
  minorStageId?: number,
): Promise<ManageTransportProps> => {
  try {
    let response: AxiosResponse<ManageTransportProps>;
    if (majorStageId) {
      response = await api.delete(
        `${prefix}/delete-major-stage-transportation/${majorStageId}`,
      );
    } else if (minorStageId) {
      response = await api.delete(
        `${prefix}/delete-minor-stage-transportation/${minorStageId}`,
      );
    }

    return {
      status: response!.status,
      backendMajorStageId: response!.data.backendMajorStageId,
    };
  } catch (error) {
    return handleBackendRequestError<ManageTransportProps>(
      error,
      'Could not delete transportation! Backend request failed.',
    );
  }
};
