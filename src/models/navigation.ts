import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { Location, MapLocation, MediumLocation } from './map';
import { ColorScheme } from './ui';
import { MajorStage } from './major_stage';
import { MinorStage } from './minor_stage';

export type BottomTabsParamList = {
  AllJourneys: undefined | { popupText?: string };
  Locations: undefined | { popupText?: string };
  UserProfile: undefined;
  Gallery: { popupText?: string; refresh?: boolean } | undefined;
};

export type MajorStageStackParamList = {
  ManageMajorStage: { majorStageId?: number; journeyId: number };
  ManageMinorStage: {
    journeyId: number;
    majorStageId: number;
    minorStageId?: number;
  };
  ManageTransportation: {
    journeyId?: number;
    majorStageId?: number;
    minorStageId?: number;
    transportationId?: number;
  };
  MinorStages: {
    journeyId: number;
    majorStageId: number;
    popupText?: string;
  };
  ManageActivity: {
    minorStageId: number;
    activityId?: number;
  };
  ManageSpending: {
    minorStageId: number;
    spendingId?: number;
  };
};

export type JourneyBottomTabsParamsList = {
  Planning: { journeyId: number; popupText?: string };
  Overview: undefined;
  Map: { majorStage?: MajorStage; minorStage?: MinorStage };
  MajorStageStackNavigator: NavigatorScreenParams<MajorStageStackParamList>;
};

export type StackParamList = {
  AuthStackNavigator: NavigatorScreenParams<AuthStackParamList>;
  BottomTabsNavigator: NavigatorScreenParams<BottomTabsParamList>;
  UserProfile: undefined;
  ManageJourney: { journeyId?: number };
  JourneyBottomTabsNavigator: NavigatorScreenParams<JourneyBottomTabsParamsList>;
  ManageCustomCountry: { countryId: number };
  ManageCustomCurrency: { currencyId?: number };
  ManagePlaceToVisit: {
    placeId: number | null;
    countryId: number | null;
    majorStageId?: number;
    lat?: number;
    lng?: number;
  };
  LocationPickMap: {
    initialTitle: string | undefined;
    initialLat: number;
    initialLng: number;
    onPickLocation: (location: MapLocation) => void;
    onResetLocation?: () => void;
    hasLocation: boolean;
    colorScheme?: ColorScheme;
    customCountryIds?: number[];
    onPressMarker?: (location: MapLocation) => void;
    onAddLocation?: (location: Location) => void;
    minorStageId?: number;
    majorStageId?: number;
    noMapTouch?: boolean;
  };
  ShowMap: {
    customCountryIds: number[];
    colorScheme?: string;
    location?: Location;
  };
  MediaShowMap: {
    mediumLocation?: MediumLocation;
  };
  ManageMedium: { mediumId?: number; lat?: number; lng?: number };
};

export type AuthStackParamList = {
  AuthScreen: undefined;
};

export type PlanningRouteProp = RouteProp<
  JourneyBottomTabsParamsList,
  'Planning'
>;
export type UserProfileRouteProp = RouteProp<StackParamList, 'UserProfile'>;

export type ManageCustomCountryRouteProp = RouteProp<
  StackParamList,
  'ManageCustomCountry'
>;

export type ManagePlaceToVisitRouteProp = RouteProp<
  StackParamList,
  'ManagePlaceToVisit'
>;
