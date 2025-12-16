import { Validable } from './other_models';
import { PlaceToVisit } from './place';

export interface CustomCountry {
  id: number;
  name: string;
  currencies: string[];
  languages: string[];
  capital: string;
  population: number;
  region: string;
  subregion: string;
  wiki_link: string;
  visited?: boolean;
  visum_regulations?: string;
  best_time_to_visit?: string;
  general_information?: string;
  placesToVisit?: PlaceToVisit[];
}

export interface CustomCountryFormValues {
  currencies: Validable<string[] | undefined>;
  languages: Validable<string[] | undefined>;
  capital: Validable<string | undefined>;
  population: Validable<number | undefined>;
  region: Validable<string | undefined>;
  subregion: Validable<string | undefined>;
  visum_regulations: Validable<string | undefined>;
  best_time_to_visit: Validable<string | undefined>;
  general_information: Validable<string | undefined>;
}
