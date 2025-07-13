import { AxiosResponse } from 'axios';

import { BACKEND_URL } from '@env';
import { Activity, ActivityFormValues } from '../../models';
import api from './api';

const prefix = `${BACKEND_URL}/activity`;

interface ManageActivityProps {
  activity?: Activity;
  activityFormValues?: ActivityFormValues;
  backendJourneyId?: number;
  status: number;
  error?: string;
}

export const createActivity = async (
  activityFormValues: ActivityFormValues,
  minorStageId?: number
): Promise<ManageActivityProps> => {
  try {
    const response: AxiosResponse<ManageActivityProps> = await api.post(
      `${prefix}/create-activity/${minorStageId}`,
      activityFormValues
    );

    // Error from backend
    if (response!.data.error) {
      return { status: response!.data.status, error: response!.data.error };
    }

    if (response!.data.activityFormValues) {
      return {
        activityFormValues: response!.data.activityFormValues,
        status: response!.data.status,
      };
    }

    return {
      activity: response!.data.activity,
      backendJourneyId: response!.data.backendJourneyId
        ? response!.data.backendJourneyId
        : undefined,
      status: response!.data.status,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not create activity!' };
  }
};

export const updateActivity = async (
  activityFormValues: ActivityFormValues,
  activityId: number,
  minorStageId: number
): Promise<ManageActivityProps> => {
  try {
    const response: AxiosResponse<ManageActivityProps> = await api.post(
      `${prefix}/update-activity/${minorStageId}/${activityId}`,
      activityFormValues
    );

    // Error from backend
    if (response!.data.error) {
      return { status: response!.data.status, error: response!.data.error };
    }

    if (response!.data.activityFormValues) {
      return {
        activityFormValues: response!.data.activityFormValues,
        status: response!.data.status,
      };
    }

    return {
      activity: response!.data.activity,
      backendJourneyId: response!.data.backendJourneyId
        ? response!.data.backendJourneyId
        : undefined,
      status: response!.data.status,
    };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not update activity!' };
  }
};

export const deleteActivity = async (
  activityId: number
): Promise<ManageActivityProps> => {
  try {
    const response: AxiosResponse<ManageActivityProps> = await api.delete(
      `${prefix}/delete-activity/${activityId}`
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
    return { status: 500, error: 'Could not delete activity!' };
  }
};
