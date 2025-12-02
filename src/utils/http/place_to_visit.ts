import { AxiosResponse } from 'axios';

import { PlaceFormValues, PlaceToVisit } from '../../models';
import api from './api';

export interface FetchPlacesProps {
  places?: PlaceToVisit[];
  countryId?: number;
  countryName?: string;
  status: number;
  error?: string;
}

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/place-to-visit`;

export const fetchPlaces = async (): Promise<FetchPlacesProps> => {
  try {
    const response: AxiosResponse<FetchPlacesProps> = await api.get(
      `${prefix}/get-places`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { places, status } = response.data;

    if (!places) {
      return { status };
    }

    return { places, status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not fetch places! Backend request failed.',
    };
  }
};

export const fetchavailablePlacesByCountry = async (
  minorStageId: number,
  countryName: string
): Promise<FetchPlacesProps> => {
  try {
    const response: AxiosResponse<FetchPlacesProps> = await api.get(
      `${prefix}/get-available-places-by-country/${minorStageId}/${countryName}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { places, countryId, status } = response.data;

    return { places, countryId, status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not fetch places! Backend request failed.',
    };
  }
};

interface ManagePlaceProps {
  place?: PlaceToVisit;
  placeFormValues?: PlaceFormValues;
  status: number;
  error?: string;
}

export const createPlace = async (
  placeFormValues: PlaceFormValues
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/create-place`,
      placeFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.placeFormValues) {
      return {
        placeFormValues: response.data.placeFormValues,
        status: response.data.status,
      };
    }

    return { place: response.data.place, status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not create place! Backend request failed.',
    };
  }
};

export const updatePlace = async (
  placeFormValues: PlaceFormValues,
  placeId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/update-place/${placeId}`,
      placeFormValues
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    if (response.data.placeFormValues) {
      return {
        placeFormValues: response.data.placeFormValues,
        status: response.data.status,
      };
    }

    return { place: response.data.place, status: response.data.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not update place! Backend request failed.',
    };
  }
};

export const deletePlace = async (
  placeId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.delete(
      `${prefix}/delete-place/${placeId}`
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
      error: 'Could not delete place! Backend request failed.',
    };
  }
};

export const toggleFavoritePlace = async (
  placeId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/toggle-favorite-place/${placeId}`
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
      error:
        'Could not change favorite state of place! Backend request failed.',
    };
  }
};

export const toggleVisitedPlace = async (
  placeId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/toggle-visited-place/${placeId}`
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
      error: 'Could not change visited state of place! Backend request failed.',
    };
  }
};

export const addMinorStageToPlace = async (
  placeId: number,
  minorStageId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/add-minor-stage-to-place/${placeId}/${minorStageId}`
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
      error:
        'Could not change add minor stage to place! Backend request failed.',
    };
  }
};

export const removeMinorStageFromPlace = async (
  placeId: number,
  minorStageId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/remove-minor-stage-from-place/${placeId}/${minorStageId}`
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
      error: 'Could not remove minor stage from place! Backend request failed.',
    };
  }
};
