import { createContext, useState } from 'react';

import { Image } from '../models/image';
import { fetchAllImages } from '../utils/http/image';

interface ImageContextType {
  images: Image[];
  fetchImages: () => Promise<void | string>;
  findImage: (imageId: number) => Image | undefined;
  deleteImage: (imageId: number) => void;
  hasImages: (
    mode: 'MinorStage' | 'MinorStages' | 'PlaceToVisit' | 'CustomCountry',
    singleId?: number,
    idArray?: number[]
  ) => boolean;
}

export const ImageContext = createContext<ImageContextType>({
  images: [],
  fetchImages: async () => {},
  findImage: () => undefined,
  deleteImage: () => undefined,
  hasImages: () => false,
});

export default function ImageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [images, setImages] = useState<Image[]>([]);

  async function fetchImages(): Promise<void | string> {
    const response = await fetchAllImages();
    if (!response.error) {
      setImages(response.images || []);
    } else {
      return response.error;
    }
  }

  function findImage(imageId: number) {
    const image = images.find((image) => image.id === imageId);
    return image;
  }

  function deleteImage(imageId: number) {
    setImages((currentImages) =>
      currentImages.filter((image) => image.id !== imageId)
    );
  }

  function hasImages(
    mode: 'MinorStage' | 'MinorStages' | 'PlaceToVisit' | 'CustomCountry',
    singleId?: number,
    idArray?: number[]
  ) {
    if (!singleId && !idArray) return false;

    if (idArray && mode === 'CustomCountry') {
      for (const img of images) {
        if (img.placeToVisitId && idArray.includes(img.placeToVisitId))
          return true;
      }
    } else if (mode === 'MinorStage') {
      for (const img of images) {
        if (img.minorStageId === singleId) return true;
      }
    } else if (mode === 'MinorStages' && idArray) {
      // TODO: Check for ids
      for (const img of images) {
        if (img.minorStageId && idArray.includes(img.minorStageId)) return true;
      }
    } else if (mode === 'PlaceToVisit') {
      for (const img of images) {
        if (img.placeToVisitId === singleId) return true;
      }
    }
    return false;
  }

  const value = {
    images,
    fetchImages,
    findImage,
    deleteImage,
    hasImages,
  };

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
}
