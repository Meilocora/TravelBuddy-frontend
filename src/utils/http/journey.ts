import { AxiosResponse } from 'axios';

import { Journey, JourneyFormValues } from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

interface FetchJourneysProps {
  journeys?: Journey[];
  status: number;
  error?: string;
}

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/journey`;

export const fetchStagesDatas = async (): Promise<FetchJourneysProps> => {
  try {
    const response: AxiosResponse<FetchJourneysProps> = await api.get(
      `${prefix}/get-stages-data`,
    );

    return { journeys: response.data.journeys, status: response.status };
  } catch (error) {
    return handleBackendRequestError<FetchJourneysProps>(
      error,
      'Could not fetch data! Backend request failed.',
    );
  }
};

interface ManageJourneyProps {
  journey?: Journey;
  journeyFormValues?: JourneyFormValues;
  status: number;
  error?: string;
}

export const createJourney = async (
  journeyFormValues: JourneyFormValues,
): Promise<ManageJourneyProps> => {
  try {
    const response: AxiosResponse<ManageJourneyProps> = await api.post(
      `${prefix}/create-journey`,
      journeyFormValues,
    );

    return { journey: response.data.journey, status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageJourneyProps>(
      error,
      'Could not create journey! Backend request failed.',
    );
  }
};

export const updateJourney = async (
  journeyFormValues: JourneyFormValues,
  journeyId: number,
): Promise<ManageJourneyProps> => {
  try {
    const response: AxiosResponse<ManageJourneyProps> = await api.post(
      `${prefix}/update-journey/${journeyId}`,
      journeyFormValues,
    );

    return { journey: response.data.journey, status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageJourneyProps>(
      error,
      'Could not update journey! Backend request failed.',
    );
  }
};

export const deleteJourney = async (
  journeyId: number,
): Promise<ManageJourneyProps> => {
  try {
    const response: AxiosResponse<ManageJourneyProps> = await api.delete(
      `${prefix}/delete-journey/${journeyId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManageJourneyProps>(
      error,
      'Could not delete journey! Backend request failed.',
    );
  }
};
