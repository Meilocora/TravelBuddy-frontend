import { Costs, Transportation, Validable } from './other_models';
import { PlaceToVisit } from './place';

export interface MinorStage {
  id: number;
  title: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  costs: Costs;
  // TODO: sequence: number;
  transportation?: Transportation;
  accommodation: Accommodation;
  activities?: Activity[];
  placesToVisit?: PlaceToVisit[];
  currentMinorStage?: boolean;
}

export interface MinorStageValues {
  title: string;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  budget: number;
  spent_money: number;
  accommodation_place: string;
  accommodation_costs: number;
  accommodation_booked: boolean;
  accommodation_latitude: number | undefined;
  accommodation_longitude: number | undefined;
  accommodation_link: string;
  // TODO: sequence: number;
}

export interface MinorStageFormValues {
  title: Validable<string>;
  scheduled_start_time: Validable<string | null>;
  scheduled_end_time: Validable<string | null>;
  budget: Validable<number>;
  spent_money: Validable<number>;
  accommodation_place: Validable<string>;
  accommodation_costs: Validable<number>;
  unconvertedAmount: Validable<string>;
  accommodation_booked: Validable<boolean>;
  accommodation_latitude: Validable<number | undefined>;
  accommodation_longitude: Validable<number | undefined>;
  accommodation_link: Validable<string>;
  // TODO: sequence: Validable<number>;
}

export interface Accommodation {
  place: string;
  costs: number;
  booked: boolean;
  link: string;
  latitude: number;
  longitude: number;
}

export interface Activity {
  id?: number;
  name: string;
  description: string;
  costs: number;
  unconvertedAmount?: string;
  booked: boolean;
  place: string;
  latitude: number | undefined;
  longitude: number | undefined;
  link: string;
}

export interface ActivityFormValues {
  name: Validable<string>;
  description: Validable<string>;
  costs: Validable<number>;
  unconvertedAmount: Validable<string>;
  booked: Validable<boolean>;
  place: Validable<string>;
  latitude: Validable<number | undefined>;
  longitude: Validable<number | undefined>;
  link: Validable<string>;
}
