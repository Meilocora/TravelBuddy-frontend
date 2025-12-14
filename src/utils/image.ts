// Check if link is an image URL
export const isImageLink = (url: string | undefined) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url);
};

import { auth, storage } from '../firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export type UploadUserImageParams = {
  localUri: string;
  userId: number;
};

export async function uploadUserImage({
  localUri,
  userId,
}: UploadUserImageParams): Promise<string> {
  // Authenticate user with Firebase
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated with Firebase');
  }

  // Load file from local URI
  const response = await fetch(localUri);
  const blob = await response.blob();

  // Derive file extension from URI (fallback: jpg)
  const ext = localUri.split('.').pop() || 'jpg';

  // Generate unique filename
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  // Path in storage
  const pathInBucket = `$${userId}/${filename}`;
  const storageRef = ref(storage, pathInBucket);

  const uploadTask = uploadBytesResumable(storageRef, blob);

  // Wait for upload
  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => reject(error),
      () => resolve()
    );
  });

  const downloadUrl = await getDownloadURL(storageRef);

  return downloadUrl; // URL for backend storage
}

// TODO: Ersetze die Funktion darüber durch diese hier
type UploadMediaParams = {
  uri: string;
  path: string; // z.B. "images/userId" oder "videos/userId"
};

export async function uploadMedia({ uri, path }: UploadMediaParams) {
  // Authenticate user with Firebase
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated with Firebase');
  }

  // Load file from local URI
  const response = await fetch(uri);
  const blob = await response.blob();

  // Derive file extension from URI (fallback: jpg)
  const ext = uri.split('.').pop() || 'dat';

  // Generate unique filename
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  // Path in storage
  const storageRef = ref(storage, `${path}/${filename}`);

  const uploadTask = uploadBytesResumable(storageRef, blob);

  // Wait for upload
  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => reject(error),
      () => resolve()
    );
  });

  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export type DeleteUserImageParams = {
  imageUrl: string; // The full download URL from Firebase Storage
  userId: number;
};

export async function deleteUserImage({
  imageUrl,
  userId,
}: DeleteUserImageParams): Promise<void> {
  try {
    // Authenticate user with Firebase
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated with Firebase');
    }
    // Extract the path from the Firebase Storage URL
    const decodedUrl = decodeURIComponent(`$${userId}/${imageUrl}`);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Invalid Firebase Storage URL');
    }

    const pathInBucket = pathMatch[1];
    const storageRef = ref(storage, pathInBucket);

    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error);
    throw error;
  }
}

// TODO: Create Thumbnail
// import * as VideoThumbnails from 'expo-video-thumbnails';

// async function createVideoThumbnail(videoUri: string) {
//   const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(
//     videoUri,
//     { time: 1000 } // 1 Sekunde
//   );

//   const thumbUrl = await uploadMedia({
//     uri: thumbUri,
//     path: `video-thumbnails/${userId}`,
//   });

//   return thumbUrl;
// }

// // TODO: Dann speichern
// const thumbUrl = await createVideoThumbnail(uri);

// await createMedia({
//   url: videoUrl,
//   media_type: 'video',
//   thumbnail_url: thumbUrl,
//   ...
// });

// TODO: Datenbank anpassen:
// {
//   "url": "https://...",
//   "media_type": "video",
//   "thumbnail_url": "https://... (optional)",
//   "duration": 37.5,
//   "latitude": ...,
//   "longitude": ...
// }
