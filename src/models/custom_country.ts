import { Validable } from './other_models';
import { PlaceToVisit } from './place';

export interface CustomCountry {
  id: number;
  name: string;
  code: string;
  timezones: string;
  currencies: string;
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
  code: Validable<string | null>;
  timezones: Validable<string | null>;
  currencies: Validable<string | null>;
  languages: Validable<string[] | null>;
  capital: Validable<string | null>;
  population: Validable<number | null>;
  region: Validable<string | null>;
  subregion: Validable<string | null>;
  visum_regulations: Validable<string | null>;
  best_time_to_visit: Validable<string | null>;
  general_information: Validable<string | null>;
}
