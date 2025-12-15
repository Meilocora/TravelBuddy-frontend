import { Validable } from './other_models';

export interface Medium {
  id: number;
  url: string;
  mediumType: 'image' | 'video';
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

export interface MediumValues {
  url: string;
  mediumType: 'image' | 'video';
  thumbnailUrl?: string;
  favorite: boolean;
  latitude?: number;
  longitude?: number;
  duration?: number;
  timestamp?: string;
  minorStageId?: number;
  placeToVisitId?: number;
  description: string;
}

export interface MediumFormValues {
  url: Validable<string>;
  mediumType: 'image' | 'video';
  favorite: Validable<boolean>;
  latitude: Validable<number | undefined>;
  longitude: Validable<number | undefined>;
  duration?: Validable<number | undefined>;
  timestamp: Validable<string | undefined>;
  minorStageId?: Validable<number | undefined>;
  placeToVisitId?: Validable<number | undefined>;
  description: Validable<string>;
}
