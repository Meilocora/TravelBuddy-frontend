import { AxiosResponse } from 'axios';

import { Journey, JourneyFormValues } from '../../models';
import api from './api';

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
      `${prefix}/get-stages-data`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { journeys, status } = response.data;

    if (!journeys) {
      return { status };
    }

    return { journeys, status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not fetch data! Backend request failed.',
    };
  }
};

interface ManageJourneyProps {
  journey?: Journey;
  journeyFormValues?: JourneyFormValues;
  status: number;
  error?: string;
}

export const createJourney = async (
  journeyFormValues: JourneyFormValues
): Promise<ManageJourneyProps> => {
  try {
    const response: AxiosResponse<ManageJourneyProps> = await api.post(
      `${prefix}/create-journey`,
      journeyFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.journeyFormValues) {
      return {
        journeyFormValues: response.data.journeyFormValues,
        status: response.data.status,
      };
    }

    return { journey: response.data.journey, status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not create journey! Backend request failed.',
    };
  }
};

export const updateJourney = async (
  journeyFormValues: JourneyFormValues,
  journeyId: number
): Promise<ManageJourneyProps> => {
  try {
    const response: AxiosResponse<ManageJourneyProps> = await api.post(
      `${prefix}/update-journey/${journeyId}`,
      journeyFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.journeyFormValues) {
      return {
        journeyFormValues: response.data.journeyFormValues,
        status: response.data.status,
      };
    }

    return { journey: response.data.journey, status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not update journey! Backend request failed.',
    };
  }
};

export const deleteJourney = async (
  journeyId: number
): Promise<ManageJourneyProps> => {
  try {
    const response: AxiosResponse<ManageJourneyProps> = await api.delete(
      `${prefix}/delete-journey/${journeyId}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not delete journey! Backend request failed.',
    };
  }
};
