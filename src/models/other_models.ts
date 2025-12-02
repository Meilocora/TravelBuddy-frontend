export interface Costs {
  id: number;
  budget: number;
  spent_money: number;
  money_exceeded: boolean;
  spendings: Spending[] | null;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  conversionRate: number;
}

export interface Spending {
  id?: number;
  name: string;
  amount: number;
  unconvertedAmount?: string;
  date: string;
  category: string;
}

export interface SpendingFormValues {
  name: Validable<string>;
  amount: Validable<number>;
  unconvertedAmount: Validable<string>;
  date: Validable<string | null>;
  category: Validable<string>;
}

export enum SpendingCategory {
  // transportations of minor and major stages, accommodations and activities are not implemented as spendings
  transportation = 'Transportation',
  acommodation = 'Acommodation',
  activities = 'Activities',
  dine_out = 'Dine out',
  basic_needs = 'Basic needs',
  souvenirs = 'Souvenirs',
  other = 'Other',
}

export interface Transportation {
  id: number;
  type: string;
  start_time: string;
  start_time_offset: string;
  arrival_time: string;
  arrival_time_offset: string;
  place_of_departure: string;
  departure_latitude: number | undefined;
  departure_longitude: number | undefined;
  place_of_arrival: string;
  arrival_latitude: number | undefined;
  arrival_longitude: number | undefined;
  transportation_costs: number;
  link?: string;
}

export interface TransportationValues {
  type: string;
  start_time: string;
  arrival_time: string;
  place_of_departure: string;
  departure_latitude: number | undefined;
  departure_longitude: number | undefined;
  place_of_arrival: string;
  arrival_latitude: number | undefined;
  arrival_longitude: number | undefined;
  transportation_costs: number;
  link?: string;
}

export interface TransportationFormValues {
  type: Validable<string>;
  start_time: Validable<string | null>;
  arrival_time: Validable<string | null>;
  place_of_departure: Validable<string | undefined>;
  departure_latitude: Validable<number | undefined>;
  departure_longitude: Validable<number | undefined>;
  place_of_arrival: Validable<string | undefined>;
  arrival_latitude: Validable<number | undefined>;
  arrival_longitude: Validable<number | undefined>;
  transportation_costs: Validable<number>;
  unconvertedAmount: Validable<string>;
  link: Validable<string>;
}

export enum TransportationType {
  bus = 'Bus',
  car = 'Car',
  boat = 'Boat',
  plane = 'Plane',
  train = 'Train',
  other = 'Other',
}

export interface Validable<T> {
  value: T;
  isValid: boolean;
  errors: string[];
}

export enum StageFilter {
  'current',
  'all',
}

export interface StagesPositionDict {
  id: number;
  position: number;
}

export type FilterKey =
  | 'activities'
  | 'accommodations'
  | 'places'
  | 'transportations';

export enum FormLimits {
  journeyName = 30,
  journeyDescription = 500,
  majorStageTitle = 30,
  majorStageAdditionalInfos = 500,
  minorStageTitle = 30,
  place = 50,
  placeDescription = 100,
  countryCapital = 50,
  countryCode = 5,
  countryPopulation = 15,
  countryRegion = 100,
  countrySubRegion = 100,
  countryTimezones = 100,
  countryLanguages = 100,
  countryBestTimeToVisit = 300,
  countryGeneralInformation = 600,
  countryVisumRegulations = 300,
  activityName = 50,
  activitiesDescription = 150,
  spendingName = 30,
  imageDescription = 200,
  deleteSize = 62,
}
