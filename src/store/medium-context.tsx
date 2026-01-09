import { createContext, useState } from 'react';

import { Medium } from '../models/media';
import { fetchAllMedia } from '../utils/http/media';

interface MediumContextType {
  media: Medium[];
  fetchMedia: () => Promise<void | string>;
  findMedium: (mediumId: number) => Medium | undefined;
  deleteMedium: (mediumId: number) => void;
  deleteMedia: (mediumIds: number[]) => void;
  hasMedia: (
    mode: 'MinorStage' | 'MinorStages' | 'PlaceToVisit' | 'CustomCountry',
    singleId?: number,
    idArray?: number[]
  ) => boolean;
}

export const MediumContext = createContext<MediumContextType>({
  media: [],
  fetchMedia: async () => {},
  findMedium: () => undefined,
  deleteMedium: () => undefined,
  deleteMedia: () => undefined,
  hasMedia: () => false,
});

export default function MediumContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [media, setMedia] = useState<Medium[]>([]);

  async function fetchMedia(): Promise<void | string> {
    const response = await fetchAllMedia();
    if (!response.error) {
      setMedia(response.media || []);
    } else {
      return response.error;
    }
  }

  function findMedium(mediumId: number) {
    const medium = media.find((medium) => medium.id === mediumId);
    return medium;
  }

  function deleteMedium(mediumId: number) {
    setMedia((currentMedia) =>
      currentMedia.filter((medium) => medium.id !== mediumId)
    );
  }

  function deleteMedia(mediumIds: number[]) {
    setMedia((currentMedia) =>
      currentMedia.filter((medium) => !mediumIds.includes(medium.id))
    );
  }

  function hasMedia(
    mode: 'MinorStage' | 'MinorStages' | 'PlaceToVisit' | 'CustomCountry',
    singleId?: number,
    idArray?: number[]
  ) {
    if (!singleId && !idArray) return false;

    if (idArray && mode === 'CustomCountry') {
      for (const medium of media) {
        if (medium.placeToVisitId && idArray.includes(medium.placeToVisitId))
          return true;
      }
    } else if (mode === 'MinorStage') {
      for (const medium of media) {
        if (medium.minorStageId === singleId) return true;
      }
    } else if (mode === 'MinorStages' && idArray) {
      for (const medium of media) {
        if (medium.minorStageId && idArray.includes(medium.minorStageId))
          return true;
      }
    } else if (mode === 'PlaceToVisit') {
      for (const medium of media) {
        if (medium.placeToVisitId === singleId) return true;
      }
    }
    return false;
  }

  const value = {
    media,
    fetchMedia,
    findMedium,
    deleteMedium,
    deleteMedia,
    hasMedia,
  };

  return (
    <MediumContext.Provider value={value}>{children}</MediumContext.Provider>
  );
}
