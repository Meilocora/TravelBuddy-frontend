import { AxiosResponse } from 'axios';

import { Activity, ActivityFormValues } from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const prefix = `${REACT_APP_BACKEND_URL}/activity`;

interface ManageActivityProps {
  activity?: Activity;
  activityFormValues?: ActivityFormValues;
  backendJourneyId?: number;
  status: number;
  error?: string;
}

export const createActivity = async (
  activityFormValues: ActivityFormValues,
  minorStageId?: number,
): Promise<ManageActivityProps> => {
  try {
    const response: AxiosResponse<ManageActivityProps> = await api.post(
      `${prefix}/create-activity/${minorStageId}`,
      activityFormValues,
    );

    return {
      activity: response.data.activity,
      backendJourneyId: response.data.backendJourneyId
        ? response.data.backendJourneyId
        : undefined,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageActivityProps>(
      error,
      'Could not create activity! Backend request failed.',
    );
  }
};

export const updateActivity = async (
  activityFormValues: ActivityFormValues,
  activityId: number,
  minorStageId: number,
): Promise<ManageActivityProps> => {
  try {
    const response: AxiosResponse<ManageActivityProps> = await api.post(
      `${prefix}/update-activity/${minorStageId}/${activityId}`,
      activityFormValues,
    );

    return {
      activity: response.data.activity,
      backendJourneyId: response.data.backendJourneyId
        ? response.data.backendJourneyId
        : undefined,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<ManageActivityProps>(
      error,
      'Could not update activity! Backend request failed.',
    );
  }
};

export const deleteActivity = async (
  activityId: number,
): Promise<ManageActivityProps> => {
  try {
    const response: AxiosResponse<ManageActivityProps> = await api.delete(
      `${prefix}/delete-activity/${activityId}`,
    );

    return {
      status: response.status,
      backendJourneyId: response.data.backendJourneyId,
    };
  } catch (error) {
    return handleBackendRequestError<ManageActivityProps>(
      error,
      'Could not delete activity! Backend request failed.',
    );
  }
};
