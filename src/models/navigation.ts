import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { Location, MapLocation } from './map';
import { ColorScheme } from './ui';
import { MajorStage } from './major_stage';
import { MinorStage } from './minor_stage';

export type BottomTabsParamList = {
  AllJourneys: undefined | { popupText?: string };
  ManageJourney: { journeyId?: number };
  Locations: undefined | { popupText?: string };
  UserProfile: undefined;
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
  JourneyBottomTabsNavigator: NavigatorScreenParams<JourneyBottomTabsParamsList>;
  ManageCustomCountry: { countryId: number };
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
    customCountryId?: number;
    onPressMarker?: (location: MapLocation) => void;
    onAddLocation?: (name: string) => void;
    minorStageId?: number;
    majorStageId?: number;
  };
  ShowMap: {
    customCountryId: number;
    colorScheme?: string;
    location?: Location;
  };
};

export type AuthStackParamList = {
  AuthScreen: undefined;
};

export type PlanningRouteProp = RouteProp<
  JourneyBottomTabsParamsList,
  'Planning'
>;
export type UserProfileRouteProp = RouteProp<StackParamList, 'UserProfile'>;

export type ManageJourneyRouteProp = RouteProp<
  BottomTabsParamList,
  'ManageJourney'
>;

export type ManageCustomCountryRouteProp = RouteProp<
  StackParamList,
  'ManageCustomCountry'
>;

export type ManagePlaceToVisitRouteProp = RouteProp<
  StackParamList,
  'ManagePlaceToVisit'
>;
