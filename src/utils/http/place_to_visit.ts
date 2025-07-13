import { AxiosResponse } from 'axios';

import { BACKEND_URL } from '@env';
import { PlaceFormValues, PlaceToVisit } from '../../models';
import api from './api';

export interface FetchPlacesProps {
  places?: PlaceToVisit[];
  countryId?: number;
  countryName?: string;
  status: number;
  error?: string;
}

const prefix = `${BACKEND_URL}/place-to-visit`;

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
    return { status: 500, error: 'Could not fetch places!' };
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
    return { status: 500, error: 'Could not fetch places!' };
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
    return { status: 500, error: 'Could not create place!' };
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
    return { status: 500, error: 'Could not update place!' };
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
    return { status: 500, error: 'Could not delete place!' };
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
    return { status: 500, error: 'Could not change favorite state of place!' };
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
    return { status: 500, error: 'Could not change visited state of place!' };
  }
};

export const addMinorStageToPlace = async (
  name: string,
  minorStageId: number
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/add-minor-stage-to-place/${name}/${minorStageId}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not change add minor stage to place!' };
  }
};

export const removeMinorStageFromPlace = async (
  name: string
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/remove-minor-stage-from-place/${name}`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    return { status: response.data.status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not remove minor stage from place!' };
  }
};
