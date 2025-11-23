import { Validable } from './other_models';

export interface PlaceToVisit {
  countryId: number;
  id: number;
  name: string;
  description: string;
  visited: boolean;
  favorite: boolean;
  latitude: number;
  longitude: number;
  link?: string;
  minorStageIds?: number[];
}

export interface PlaceValues {
  countryId: number;
  id?: number;
  name: string;
  description: string;
  visited: boolean;
  favorite: boolean;
  latitude?: number;
  longitude?: number;
  link?: string;
  minorStageIds?: number[];
}

export interface PlaceFormValues {
  countryId: Validable<number>;
  name: Validable<string>;
  description: Validable<string>;
  visited: Validable<boolean>;
  favorite: Validable<boolean>;
  latitude: Validable<number | undefined>;
  longitude: Validable<number | undefined>;
  link: Validable<string>;
}
