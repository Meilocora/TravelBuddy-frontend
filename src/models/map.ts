import { TransportationType } from '.';

export interface MapLocation {
  id?: string;
  title?: string;
  lat: number | undefined;
  lng: number | undefined;
}

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

export enum LocationType {
  transportation_departure = 'transportation_departure',
  transportation_arrival = 'transportation_arrival',
  accommodation = 'accommodation',
  activity = 'activity',
  placeToVisit = 'placeToVisit',
}

export interface Location {
  id?: number;
  belonging: string;
  locationType: LocationType;
  data: LocationData;
  done: boolean;
  minorStageName?: string;
  description?: string;
  transportationType?: TransportationType;
  color?: string;
}
