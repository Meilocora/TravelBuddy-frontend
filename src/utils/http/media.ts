import { AxiosResponse } from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import api from './api';

import { createVideoThumbnail, deleteUserImage, uploadMedium } from '../media';
import { Medium, MediumFormValues } from '../../models/media';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/medium`;

interface FetchMediaProps {
  media?: Medium[];
  status: number;
  error?: string;
}

export const fetchAllMedia = async (): Promise<FetchMediaProps> => {
  try {
    const response: AxiosResponse<FetchMediaProps> = await api.get(
      `${prefix}/get-media`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { media, status } = response.data;

    if (!media) {
      return { status };
    }

    return { media, status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not fetch media!' };
  }
};

interface ManageMediumProps {
  userId?: number;
  medium?: Medium;
  mediumId?: number;
  status: number;
  error?: string;
}

export const addMedium = async (
  userId: number,
  mediumFormValues: MediumFormValues
): Promise<ManageMediumProps> => {
  let thumbnailUrl: string | undefined = undefined;
  // 1. Upload to Firebase Storage
  try {
    const downloadUrl = await uploadMedium({
      uri: mediumFormValues.url.value,
      path: `${mediumFormValues.mediumType}s/${userId}`,
    });

    mediumFormValues.url.value = downloadUrl;

    // If video, create thumbnail and upload
    if (mediumFormValues.mediumType === 'video') {
      thumbnailUrl = await createVideoThumbnail(
        mediumFormValues.url.value,
        userId
      );
    }
  } catch (error) {
    // Error from firebase upload
    return {
      status: 500,
      error: 'Could not add medium! Firebase upload failed.',
    };
  }

  // 2. Create medium in backend (url = downloadUrl from firebase)
  const mediumData = { ...mediumFormValues, thumbnailUrl };
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.post(
      `${prefix}/add-medium`,
      mediumData
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
      error: 'Could not add medium! Backend request failed.',
    };
  }
};

export const updateMedium = async (
  mediumFormValues: MediumFormValues,
  mediumId: number
): Promise<ManageMediumProps> => {
  // Only Update Data in backend
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.post(
      `${prefix}/update-medium/${mediumId}`,
      mediumFormValues
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
      error: 'Could not update medium! Backend request failed.',
    };
  }
};

export const deleteMedium = async (
  medium: Medium,
  userId: number
): Promise<ManageMediumProps> => {
  // 1. Delete medium from Firebase Storage
  try {
    await deleteUserImage({
      folderName: medium.mediumType === 'image' ? 'images' : 'videos',
      imageUrl: medium.url,
      userId: userId,
    });
  } catch (error) {
    // Error from firebase upload
    return {
      status: 500,
      error: 'Could not delete medium! Firebase deletion failed.',
    };
  }

  // 2. If video => Delete thumbnail from Firebase Storage
  if (medium.mediumType === 'video' && medium.thumbnailUrl) {
    try {
      await deleteUserImage({
        folderName: 'video-thumbnails',
        imageUrl: medium.thumbnailUrl,
        userId: userId,
      });
    } catch (error) {
      // Error from firebase upload
      return {
        status: 500,
        error: 'Could not delete medium! Firebase deletion failed.',
      };
    }
  }

  // 3. Delete medium in backend
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.delete(
      `${prefix}/delete-medium/${medium.id}`
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
      error: 'Could not delete medium! Backend request failed.',
    };
  }
};

export type DownloadUserMediumParams = {
  medium: Medium;
  filename?: string;
};

export async function downloadUserMedium({
  medium,
  filename,
}: DownloadUserMediumParams): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }

    // 2. Generate filename if not provided
    const finalFilename = filename || `${medium.timestamp}_travelbuddy.jpg`;
    const fileUri = `${FileSystem.documentDirectory}${finalFilename}`;

    // 3. Download the image
    const downloadResult = await FileSystem.downloadAsync(medium.url, fileUri);
    // 4. Save to media library (gallery)
    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
    await MediaLibrary.createAlbumAsync('TravelBuddy', asset, false);

    return { success: true };
  } catch (error) {
    console.error('Error downloading image:', error);
    return { success: false, error: String(error) };
  }
}
