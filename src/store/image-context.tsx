import { createContext, useState } from 'react';

import { Image } from '../models/image';
import { fetchAllImages } from '../utils/http/image';

interface ImageContextType {
  images: Image[];
  fetchImages: () => Promise<void | string>;
  findImage: (imageId: number) => Image | undefined;
  deleteImage: (imageId: number) => void;
}

export const ImageContext = createContext<ImageContextType>({
  images: [],
  fetchImages: async () => {},
  findImage: () => undefined,
  deleteImage: () => undefined,
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

  const value = {
    images,
    fetchImages,
    findImage,
    deleteImage,
  };

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
}
