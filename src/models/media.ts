import { Validable } from './other_models';

export interface Image {
  id: number;
  url: string;
  favorite: boolean;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  minorStageId?: number;
  placeToVisitId?: number;
  description: string;
}

export interface ImageValues {
  url: string;
  favorite: boolean;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
  minorStageId?: number;
  placeToVisitId?: number;
  description: string;
}

export interface CustomMedia {
  id: number;
  url: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  favorite: boolean;
  latitude: number | null;
  longitude: number | null;
  duration?: number;
  timestamp: string;
  minorStageId?: number;
  placeToVisitId?: number;
  description: string;
}

export interface MediaValues {
  url: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  favorite: boolean;
  latitude: number;
  longitude: number;
  duration?: number;
  timestamp: string;
  minorStageId?: number;
  placeToVisitId?: number;
  description: string;
}

export interface MediaFormValues {
  url: Validable<string>;
  mediaType: 'image' | 'video';
  thumbnailUrl?: Validable<string | undefined>;
  favorite: Validable<boolean>;
  latitude: Validable<number | undefined>;
  longitude: Validable<number | undefined>;
  duration?: Validable<number | undefined>;
  timestamp: Validable<string | undefined>;
  minorStageId?: Validable<number | undefined>;
  placeToVisitId?: Validable<number | undefined>;
  description: Validable<string>;
}

export interface ImageFormValues {
  url: Validable<string>;
  favorite: Validable<boolean>;
  latitude: Validable<number | undefined>;
  longitude: Validable<number | undefined>;
  timestamp: Validable<string | undefined>;
  minorStageId?: Validable<number | undefined>;
  placeToVisitId?: Validable<number | undefined>;
  description: Validable<string>;
}
