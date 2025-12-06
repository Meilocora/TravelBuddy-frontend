import { AxiosResponse } from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import { deleteUserImage, uploadUserImage } from '../image';
import { Image, ImageFormValues } from '../../models/image';
import api from './api';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const prefix = `${REACT_APP_BACKEND_URL}/images`;

interface FetchImagesProps {
  images?: Image[];
  status: number;
  error?: string;
}

export const fetchAllImages = async (): Promise<FetchImagesProps> => {
  try {
    const response: AxiosResponse<FetchImagesProps> = await api.get(
      `${prefix}/get-images`
    );

    // Error from backend
    if (response.data.error) {
      return { status: response.data.status, error: response.data.error };
    }

    const { images, status } = response.data;

    if (!images) {
      return { status };
    }

    return { images, status };
  } catch (error) {
    // Error from frontend
    return { status: 500, error: 'Could not fetch images!' };
  }
};

interface ManageImageProps {
  userId?: number;
  image?: Image;
  imageId?: number;
  status: number;
  error?: string;
}

export const addImage = async (
  userId: number,
  imageFormValues: ImageFormValues
): Promise<ManageImageProps> => {
  // 1. Upload to Firebase Storage
  try {
    const downloadUrl = await uploadUserImage({
      localUri: imageFormValues.url.value,
      userId,
    });
    imageFormValues.url.value = downloadUrl;
  } catch (error) {
    // Error from firebase upload
    return {
      status: 500,
      error: 'Could not add image! Firebase upload failed.',
    };
  }

  // 2. Create image in backend (url = downloadUrl from firebase)
  try {
    const response: AxiosResponse<ManageImageProps> = await api.post(
      `${prefix}/add-image`,
      imageFormValues
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
      error: 'Could not add image! Backend request failed.',
    };
  }
};

export const updateImage = async (
  imageFormValues: ImageFormValues,
  imageId: number
): Promise<ManageImageProps> => {
  // Only Update Data in backend
  try {
    const response: AxiosResponse<ManageImageProps> = await api.post(
      `${prefix}/update-image/${imageId}`,
      imageFormValues
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
      error: 'Could not update image! Backend request failed.',
    };
  }
};

export const deleteImage = async (
  image: Image,
  userId: number
): Promise<ManageImageProps> => {
  // 1. Delete to Firebase Storage
  try {
    const downloadUrl = await deleteUserImage({
      imageUrl: image.url,
      userId: userId,
    });
  } catch (error) {
    // Error from firebase upload
    return {
      status: 500,
      error: 'Could not delete image! Firebase deletion failed.',
    };
  }

  // 2. Delete image in backend
  try {
    const response: AxiosResponse<ManageImageProps> = await api.delete(
      `${prefix}/delete-image/${image.id}`
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
      error: 'Could not delete image! Backend request failed.',
    };
  }
};

export type DownloadUserImageParams = {
  image: Image;
  filename?: string;
};

export async function downloadUserImage({
  image,
  filename,
}: DownloadUserImageParams): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }

    // 2. Generate filename if not provided
    const finalFilename = filename || `${image.timestamp}_travelbuddy.jpg`;
    const fileUri = `${FileSystem.documentDirectory}${finalFilename}`;

    // 3. Download the image
    const downloadResult = await FileSystem.downloadAsync(image.url, fileUri);

    // 4. Save to media library (gallery)
    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
    await MediaLibrary.createAlbumAsync('TravelBuddy', asset, false);

    return { success: true };
  } catch (error) {
    console.error('Error downloading image:', error);
    return { success: false, error: String(error) };
  }
}
