import { AxiosResponse } from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import api from './api';

import {
  createVideoThumbnail,
  deleteUserImage,
  deleteUserImages,
  uploadMedium,
} from '../media';
import { MediaStorageMode, Medium, MediumFormValues } from '../../models/media';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/medium`;

interface FetchMediaProps {
  media?: Medium[];
  storageMode?: MediaStorageMode;
  status: number;
  error?: string;
}

export const fetchAllMedia = async (
  storageMode: MediaStorageMode,
): Promise<FetchMediaProps> => {
  try {
    const response: AxiosResponse<FetchMediaProps> = await api.get(
      `${prefix}/get-media/${storageMode}`,
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.status, error: response.data.error };
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
  madiaIds?: number[];
  status: number;
  error?: string;
}

export const addMedium = async (
  userId: number,
  mediumFormValues: MediumFormValues,
  picked: boolean,
): Promise<ManageMediumProps> => {
  if (mediumFormValues.storageType === 'local') {
    return saveMediumLocally(mediumFormValues, picked);
  } else if (mediumFormValues.storageType === 'firebase') {
    return saveMediumOnFirebase(userId, mediumFormValues);
  }
  return { status: 500, error: 'Invalid storage type!' };
};

const saveMediumOnFirebase = async (
  userId: number,
  mediumFormValues: MediumFormValues,
): Promise<ManageMediumProps> => {
  let thumbnailUrl: string | undefined = undefined;
  let downloadUrl: string | undefined = undefined;
  // 1. Upload to Firebase Storage
  try {
    downloadUrl = await uploadMedium({
      uri: mediumFormValues.url.value,
      path: `${mediumFormValues.mediumType}s/${userId}`,
    });

    // If video, create thumbnail and upload
    if (mediumFormValues.mediumType === 'video') {
      thumbnailUrl = await createVideoThumbnail(
        mediumFormValues.url.value,
        userId,
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
  const updatedMediumFormValues: MediumFormValues = {
    ...mediumFormValues,
    assetId: {
      ...mediumFormValues.assetId,
      value: '',
    },
    url: {
      ...mediumFormValues.url,
      value: thumbnailUrl ?? downloadUrl,
    },
  };

  return addMediumToBackend(updatedMediumFormValues);
};

const saveMediumLocally = async (
  mediumFormValues: MediumFormValues,
  picked: boolean,
): Promise<ManageMediumProps> => {
  // Only save medium locally if it was not picked from the media library
  if (!picked) {
    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      throw new Error('Media library permission denied.');
    }

    const asset = await MediaLibrary.createAssetAsync(
      mediumFormValues.url.value,
    );

    const updatedMediumFormValues: MediumFormValues = {
      ...mediumFormValues,
      assetId: {
        ...mediumFormValues.assetId,
        value: asset.id,
      },
      url: {
        ...mediumFormValues.url,
        value: asset.uri,
      },
    };
    return addMediumToBackend(updatedMediumFormValues);
  } else {
    return addMediumToBackend(mediumFormValues);
  }
};

const addMediumToBackend = async (
  mediumFormValues: MediumFormValues,
): Promise<ManageMediumProps> => {
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.post(
      `${prefix}/add-medium`,
      mediumFormValues,
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.status, error: response.data.error };
    }

    return { status: response.status };
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
  mediumId: number,
): Promise<ManageMediumProps> => {
  // Only Update Data in backend
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.post(
      `${prefix}/update-medium/${mediumId}`,
      mediumFormValues,
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.status, error: response.data.error };
    }

    return { status: response.status };
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
  userId: number,
): Promise<ManageMediumProps> => {
  if (medium.storageType === 'firebase') {
    return deleteMediumFromFirebase(medium, userId);
  } else if (medium.storageType === 'local') {
    return deleteMediumLocally(medium);
  }
  return { status: 500, error: 'Invalid storage type!' };
};

const deleteMediumFromFirebase = async (
  medium: Medium,
  userId: number,
): Promise<ManageMediumProps> => {
  // 1. Delete medium from Firebase Storage
  try {
    deleteUserImage({
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
      deleteUserImage({
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
  return deleteMediumFromBackend(medium);
};

const deleteMediumLocally = async (
  medium: Medium,
): Promise<ManageMediumProps> => {
  // Anmerkung: Medium wird nicht lokal gelöscht, da die verwendete Version von MediaLibrary.deleteAssetsAsync möglicherweise nicht zuverlässig funktioniert.
  // if (!medium.assetId) {
  //   throw new Error('Local medium has no asset ID.');
  // }

  // await MediaLibrary.deleteAssetsAsync([medium.assetId]);

  return deleteMediumFromBackend(medium);
};

const deleteMediumFromBackend = async (
  medium: Medium,
): Promise<ManageMediumProps> => {
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.delete(
      `${prefix}/delete-medium/${medium.id}`,
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.status, error: response.data.error };
    }

    return { status: response.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not delete medium! Backend request failed.',
    };
  }
};

// TODO: Somehow this does not work
export const deleteMedia = async (
  media: Medium[],
  userId: number,
): Promise<ManageMediumProps> => {
  // Reuse the verified single-delete flow for each medium.
  // The bulk delete approach below is kept as commented reference because
  // the DELETE request with body has been unreliable in this project.
  for (const medium of media) {
    const response = await deleteMedium(medium, userId);

    if (response.error || response.status !== 200) {
      return {
        status: response.status,
        error:
          response.error ||
          `Could not delete all media. Failed on medium ${medium.id}.`,
      };
    }
  }

  return { status: 200 };

  /*
  const deleteData = [];
  for (const medium of media) {
    if (medium.mediumType === 'video' && medium.thumbnailUrl) {
      deleteData.push({
        folderName: 'videos' as const,
        imageUrl: medium.url,
      });
      deleteData.push({
        folderName: 'video-thumbnails' as const,
        imageUrl: medium.thumbnailUrl,
      });
    } else {
      deleteData.push({
        folderName: 'images' as const,
        imageUrl: medium.url,
      });
    }
  }
  // 1. Delete media from Firebase Storage
  try {
    await deleteUserImages({
      deleteData: deleteData,
      userId: userId,
    });
  } catch (error) {
    // Error from firebase upload
    return {
      status: 500,
      error: 'Could not delete medium! Firebase deletion failed.',
    };
  }

  // 2. Delete media in backend
  const mediaIds = media.map((m) => m.id);
  try {
    const response: AxiosResponse<ManageMediumProps> = await api.delete(
      `${prefix}/delete-media`,
      { data: { ids: mediaIds } },
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.status, error: response.data.error };
    }

    return { status: response.status };
  } catch (error) {
    // Error from frontend
    return {
      status: 500,
      error: 'Could not delete medium! Backend request failed.',
    };
  }
  */
};

export type DownloadUserMediumParams = {
  medium: Medium;
  filename?: string;
};

export async function downloadUserMedium({
  medium,
  filename,
}: DownloadUserMediumParams): Promise<{
  success: boolean;
  error?: string;
} | void> {
  if (medium.storageType === 'local') {
    // Local storage is not supported for downloading
    return;
  } else if (medium.storageType === 'firebase') {
    try {
      // 1. Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      // 2. Generate filename if not provided
      const extension = medium.mediumType === 'video' ? 'mp4' : 'jpg';
      const finalFilename =
        filename || `${medium.timestamp}_travelbuddy.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${finalFilename}`;

      // 3. Download the image
      const downloadResult = await FileSystem.downloadAsync(
        medium.url,
        fileUri,
      );
      // 4. Save to media library (gallery)
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync('TravelBuddy', asset, false);

      return { success: true };
    } catch (error) {
      console.error('Error downloading image:', error);
      return { success: false, error: String(error) };
    }
  }
}
