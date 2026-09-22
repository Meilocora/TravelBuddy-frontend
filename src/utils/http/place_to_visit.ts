import { AxiosResponse } from 'axios';

import { PlaceFormValues, PlaceToVisit } from '../../models';
import api from './api';
import { handleBackendRequestError } from './common';

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
      `${prefix}/get-places`,
    );

    return { places: response.data.places, status: response.status };
  } catch (error) {
    return handleBackendRequestError<FetchPlacesProps>(
      error,
      'Could not fetch places! Backend request failed.',
    );
  }
};

export const fetchavailablePlacesByCountry = async (
  minorStageId: number,
  countryName: string,
): Promise<FetchPlacesProps> => {
  try {
    const response: AxiosResponse<FetchPlacesProps> = await api.get(
      `${prefix}/get-available-places-by-country/${minorStageId}/${countryName}`,
    );

    return {
      places: response.data.places,
      countryId: response.data.countryId,
      status: response.status,
    };
  } catch (error) {
    return handleBackendRequestError<FetchPlacesProps>(
      error,
      'Could not fetch places! Backend request failed.',
    );
  }
};

interface ManagePlaceProps {
  place?: PlaceToVisit;
  placeFormValues?: PlaceFormValues;
  status: number;
  error?: string;
}

export const createPlace = async (
  placeFormValues: PlaceFormValues,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/create-place`,
      placeFormValues,
    );

    return { place: response.data.place, status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not create place! Backend request failed.',
    );
  }
};

export const updatePlace = async (
  placeFormValues: PlaceFormValues,
  placeId: number,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/update-place/${placeId}`,
      placeFormValues,
    );

    return { place: response.data.place, status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not update place! Backend request failed.',
    );
  }
};

export const deletePlace = async (
  placeId: number,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.delete(
      `${prefix}/delete-place/${placeId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not delete place! Backend request failed.',
    );
  }
};

export const toggleFavoritePlace = async (
  placeId: number,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/toggle-favorite-place/${placeId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not change favorite state of place! Backend request failed.',
    );
  }
};

export const toggleVisitedPlace = async (
  placeId: number,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/toggle-visited-place/${placeId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not change visited state of place! Backend request failed.',
    );
  }
};

export const addMinorStageToPlace = async (
  placeId: number,
  minorStageId: number,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/add-minor-stage-to-place/${placeId}/${minorStageId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not change add minor stage to place! Backend request failed.',
    );
  }
};

export const removeMinorStageFromPlace = async (
  placeId: number,
  minorStageId: number,
): Promise<ManagePlaceProps> => {
  try {
    const response: AxiosResponse<ManagePlaceProps> = await api.post(
      `${prefix}/remove-minor-stage-from-place/${placeId}/${minorStageId}`,
    );

    return { status: response.status };
  } catch (error) {
    return handleBackendRequestError<ManagePlaceProps>(
      error,
      'Could not remove minor stage from place! Backend request failed.',
    );
  }
};
