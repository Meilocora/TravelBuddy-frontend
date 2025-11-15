import { LatLng, Region } from 'react-native-maps';
import Constants from 'expo-constants';
import * as ExpoLocation from 'expo-location';
import { generateColorsSet } from './generator';
import {
  Journey,
  Location,
  LocationType,
  MajorStage,
  MapScopeType,
  MinorStage,
  PlaceToVisit,
  TransportationType,
} from '../models';
import { parseDate, parseDateAndTime } from './formatting';
import { useContext } from 'react';
import { StagesContext } from '../store/stages-context';
import { CustomCountryContext } from '../store/custom-country-context';

const GOOGLE_API_KEY =
  Constants.expoConfig?.extra?.googleApiKey ||
  process.env.REACT_APP_GOOGLE_API_KEY;

export function getMapPreview({ latitude, longitude }: LatLng) {
  const imagePreviewUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:S%7C${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
  return imagePreviewUrl;
}

export async function getAddress({ latitude, longitude }: LatLng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch address!');
  }

  const data = await response.json();
  const address = data.results[0].formatted_address;

  return address;
}

export async function getPlaceDetails(place: any): Promise<LatLng> {
  const url = `https://places.googleapis.com/v1/places/${place.placeId}?fields=location&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch address!');
  }

  const data = await response.json();
  const latLng = {
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  };

  return latLng;
}

export const useLocationPermissions = () => {
  const verifyPermissions = async () => {
    // Check current status
    const { status } = await ExpoLocation.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      // Request permissions
      const { status: requestStatus } =
        await ExpoLocation.requestForegroundPermissionsAsync();
      return requestStatus === 'granted';
    }

    return true;
  };

  return { verifyPermissions };
};

/**
 * Gets the current location of the user.
 * @returns {Promise<{ latitude: number; longitude: number }>} The user's current location.
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const location = await ExpoLocation.getCurrentPositionAsync();
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function getRegionForLocations(
  locations: Location[]
): Promise<Region> {
  if (locations.length === 0) {
    // Default region if no locations are available
    const { verifyPermissions } = useLocationPermissions();
    const location = await getCurrentLocation();
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.04,
    };
  }

  const latitudes = locations.map((loc) => loc.data.latitude);
  const longitudes = locations.map((loc) => loc.data.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = (maxLat - minLat) * 1.2; // Add padding (20%)
  const longitudeDelta = (maxLng - minLng) * 1.2; // Add padding (20%)

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
}

export function getMapLocationsFromJourney(
  journey: Journey,
  showPastLocations: boolean
): Location[] | undefined {
  const locations: Location[] = [];
  const currentDate = new Date();

  if (!journey || !journey.majorStages || journey.majorStages.length === 0) {
    return undefined;
  }
  for (const majorStage of journey.majorStages) {
    if (majorStage.transportation) {
      locations.push({
        id: majorStage.transportation.id,
        belonging: majorStage.title,
        locationType: LocationType.transportation_departure,
        transportationType: majorStage.transportation
          .type as TransportationType,
        data: {
          name: majorStage.transportation.place_of_departure,
          latitude: majorStage.transportation.departure_latitude!,
          longitude: majorStage.transportation.departure_longitude!,
        },
        done:
          parseDateAndTime(majorStage.transportation.start_time) < currentDate,
      });
      locations.push({
        id: majorStage.transportation.id,
        belonging: majorStage.title,
        locationType: LocationType.transportation_arrival,
        transportationType: majorStage.transportation
          .type as TransportationType,
        data: {
          name: majorStage.transportation.place_of_arrival,
          latitude: majorStage.transportation.arrival_latitude!,
          longitude: majorStage.transportation.arrival_longitude!,
        },
        done:
          parseDateAndTime(majorStage.transportation.arrival_time) <
          currentDate,
      });
    }
    if (majorStage.minorStages) {
      for (const minorStage of majorStage.minorStages) {
        if (minorStage.transportation) {
          locations.push({
            id: minorStage.id,
            minorStageName: minorStage.title,
            belonging: majorStage.title,
            locationType: LocationType.transportation_departure,
            transportationType: minorStage.transportation
              .type as TransportationType,
            data: {
              name: minorStage.transportation.place_of_departure,
              latitude: minorStage.transportation.departure_latitude!,
              longitude: minorStage.transportation.departure_longitude!,
            },
            done:
              parseDateAndTime(minorStage.transportation.start_time) <
              currentDate,
          });
          locations.push({
            id: minorStage.id,
            minorStageName: minorStage.title,
            belonging: majorStage.title,
            locationType: LocationType.transportation_arrival,
            transportationType: minorStage.transportation
              .type as TransportationType,
            data: {
              name: minorStage.transportation.place_of_arrival,
              latitude: minorStage.transportation.arrival_latitude!,
              longitude: minorStage.transportation.arrival_longitude!,
            },
            done:
              parseDateAndTime(minorStage.transportation.arrival_time) <
              currentDate,
          });
        }
        if (
          minorStage.accommodation.latitude &&
          minorStage.accommodation.longitude
        ) {
          locations.push({
            id: minorStage.id,
            minorStageName: minorStage.title,
            belonging: majorStage.title,
            locationType: LocationType.accommodation,
            data: {
              name: minorStage.accommodation.place,
              latitude: minorStage.accommodation.latitude,
              longitude: minorStage.accommodation.longitude,
            },
            done: parseDate(minorStage.scheduled_end_time) < currentDate,
          });
        }
        if (minorStage.activities) {
          for (const activity of minorStage.activities) {
            if (activity.latitude && activity.longitude) {
              locations.push({
                id: activity.id,
                minorStageName: minorStage.title,
                belonging: majorStage.title,
                locationType: LocationType.activity,
                description: activity.description || '',
                data: {
                  name: activity.name,
                  latitude: activity.latitude,
                  longitude: activity.longitude,
                },
                done: parseDate(minorStage.scheduled_end_time) < currentDate,
              });
            }
          }
        }
        if (minorStage.placesToVisit) {
          for (const place of minorStage.placesToVisit) {
            locations.push({
              id: place.id,
              minorStageName: minorStage.title,
              belonging: majorStage.title,
              locationType: LocationType.placeToVisit,
              description: place.description || '',
              data: {
                name: place.name,
                latitude: place.latitude,
                longitude: place.longitude,
              },
              done: place.visited || false,
            });
          }
        }
      }
    }
  }

  if (!showPastLocations) {
    const filteredLocations = locations.filter(
      (location) => location.done === false
    );
    return filteredLocations || undefined;
  }

  return locations || undefined;
}

export function getMapLocationsFromMajorStage(
  majorStage: MajorStage,
  showPastLocations: boolean
): Location[] | undefined {
  const locations: Location[] = [];
  const currentDate = new Date();

  if (majorStage.transportation) {
    locations.push({
      id: majorStage.transportation.id,
      belonging: majorStage.title,
      locationType: LocationType.transportation_departure,
      transportationType: majorStage.transportation.type as TransportationType,
      data: {
        name: majorStage.transportation.place_of_departure,
        latitude: majorStage.transportation.departure_latitude!,
        longitude: majorStage.transportation.departure_longitude!,
      },
      done:
        parseDateAndTime(majorStage.transportation.start_time) < currentDate,
    });
    locations.push({
      id: majorStage.transportation.id,
      belonging: majorStage.title,
      locationType: LocationType.transportation_arrival,
      transportationType: majorStage.transportation.type as TransportationType,
      data: {
        name: majorStage.transportation.place_of_arrival,
        latitude: majorStage.transportation.arrival_latitude!,
        longitude: majorStage.transportation.arrival_longitude!,
      },
      done:
        parseDateAndTime(majorStage.transportation.arrival_time) < currentDate,
    });
  }
  if (majorStage.minorStages) {
    for (const minorStage of majorStage.minorStages) {
      if (minorStage.transportation) {
        locations.push({
          id: minorStage.id,
          minorStageName: minorStage.title,
          belonging: majorStage.title,
          locationType: LocationType.transportation_departure,
          transportationType: minorStage.transportation
            .type as TransportationType,
          data: {
            name: minorStage.transportation.place_of_departure,
            latitude: minorStage.transportation.departure_latitude!,
            longitude: minorStage.transportation.departure_longitude!,
          },
          done:
            parseDateAndTime(minorStage.transportation.start_time) <
            currentDate,
        });
        locations.push({
          id: minorStage.id,
          minorStageName: minorStage.title,
          belonging: majorStage.title,
          locationType: LocationType.transportation_arrival,
          transportationType: minorStage.transportation
            .type as TransportationType,
          data: {
            name: minorStage.transportation.place_of_arrival,
            latitude: minorStage.transportation.arrival_latitude!,
            longitude: minorStage.transportation.arrival_longitude!,
          },
          done:
            parseDateAndTime(minorStage.transportation.arrival_time) <
            currentDate,
        });
      }
      if (
        minorStage.accommodation.latitude &&
        minorStage.accommodation.longitude
      ) {
        locations.push({
          id: minorStage.id,
          minorStageName: minorStage.title,
          belonging: majorStage.title,
          locationType: LocationType.accommodation,
          data: {
            name: minorStage.accommodation.place,
            latitude: minorStage.accommodation.latitude,
            longitude: minorStage.accommodation.longitude,
          },
          done: parseDate(minorStage.scheduled_end_time) < currentDate,
        });
      }
      if (minorStage.activities) {
        for (const activity of minorStage.activities) {
          if (activity.latitude && activity.longitude) {
            locations.push({
              id: activity.id,
              minorStageName: minorStage.title,
              belonging: majorStage.title,
              locationType: LocationType.activity,
              description: activity.description || '',
              data: {
                name: activity.name,
                latitude: activity.latitude,
                longitude: activity.longitude,
              },
              done: parseDate(minorStage.scheduled_end_time) < currentDate,
            });
          }
        }
      }
      if (minorStage.placesToVisit) {
        for (const place of minorStage.placesToVisit) {
          locations.push({
            id: place.id,
            minorStageName: minorStage.title,
            belonging: majorStage.title,
            locationType: LocationType.placeToVisit,
            description: place.description || '',
            data: {
              name: place.name,
              latitude: place.latitude,
              longitude: place.longitude,
            },
            done: place.visited || false,
          });
        }
      }
    }
  }

  if (!showPastLocations) {
    const filteredLocations = locations.filter(
      (location) => location.done === false
    );
    return filteredLocations || undefined;
  }

  return locations || undefined;
}

export function getMapLocationsFromMinorStage(
  minorStage: MinorStage,
  majorStage: MajorStage,
  showPastLocations: boolean
): Location[] | undefined {
  const locations: Location[] = [];
  const currentDate = new Date();

  if (minorStage.transportation) {
    locations.push({
      id: minorStage.id,
      minorStageName: minorStage.title,
      belonging: majorStage.title,
      locationType: LocationType.transportation_departure,
      transportationType: minorStage.transportation.type as TransportationType,
      data: {
        name: minorStage.transportation.place_of_departure,
        latitude: minorStage.transportation.departure_latitude!,
        longitude: minorStage.transportation.departure_longitude!,
      },
      done:
        parseDateAndTime(minorStage.transportation.start_time) < currentDate,
    });
    locations.push({
      id: minorStage.id,
      minorStageName: minorStage.title,
      belonging: majorStage.title,
      locationType: LocationType.transportation_arrival,
      transportationType: minorStage.transportation.type as TransportationType,
      data: {
        name: minorStage.transportation.place_of_arrival,
        latitude: minorStage.transportation.arrival_latitude!,
        longitude: minorStage.transportation.arrival_longitude!,
      },
      done:
        parseDateAndTime(minorStage.transportation.arrival_time) < currentDate,
    });
  }
  if (minorStage.accommodation.latitude && minorStage.accommodation.longitude) {
    locations.push({
      id: minorStage.id,
      minorStageName: minorStage.title,
      belonging: minorStage.title,
      locationType: LocationType.accommodation,
      data: {
        name: minorStage.accommodation.place,
        latitude: minorStage.accommodation.latitude,
        longitude: minorStage.accommodation.longitude,
      },
      done: parseDate(minorStage.scheduled_end_time) < currentDate,
    });
  }
  if (minorStage.activities) {
    for (const activity of minorStage.activities) {
      if (activity.latitude && activity.longitude) {
        locations.push({
          id: activity.id,
          minorStageName: minorStage.title,
          belonging: majorStage.title,
          locationType: LocationType.activity,
          description: activity.description || '',
          data: {
            name: activity.name,
            latitude: activity.latitude,
            longitude: activity.longitude,
          },
          done: parseDate(minorStage.scheduled_end_time) < currentDate,
        });
      }
    }
  }
  if (minorStage.placesToVisit) {
    for (const place of minorStage.placesToVisit) {
      locations.push({
        id: place.id,
        minorStageName: minorStage.title,
        belonging: majorStage.title,
        locationType: LocationType.placeToVisit,
        description: place.description || '',
        data: {
          name: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
        },
        done: place.visited || false,
      });
    }
  }

  if (!showPastLocations) {
    const filteredLocations = locations.filter(
      (location) => location.done === false
    );
    return filteredLocations || undefined;
  }

  return locations || undefined;
}

export function addColor(
  locations: Location[],
  stageType: MapScopeType
): Location[] {
  if (stageType === 'Journey') {
    const uniqueMajorStageNames = Array.from(
      new Set(locations.map((location) => location.belonging))
    );

    if (uniqueMajorStageNames.length > 1) {
      const colors = generateColorsSet(uniqueMajorStageNames.length);

      // Create a mapping of belonging to colors
      const belongingColorMap = uniqueMajorStageNames.reduce(
        (acc, stageName, index) => {
          acc[stageName] = colors[index];
          return acc;
        },
        {} as Record<string, string>
      );

      // Assign colors to locations based on their belonging
      locations.forEach((location) => {
        location.color = belongingColorMap[location.belonging];
      });
      return locations;
    } else {
      locations.forEach((location) => {
        // delete location.color;
        location.color = undefined;
      });
      return locations;
    }
  } else if (stageType === 'MajorStage') {
    // Count occurrences of minorStageName
    const uniqueMinorStageNames = Array.from(
      new Set(
        locations.map((location) =>
          location.minorStageName ? location.minorStageName : undefined
        )
      )
    ).filter((name) => name !== undefined);
    if (uniqueMinorStageNames.length > 1) {
      const colors = generateColorsSet(uniqueMinorStageNames.length);

      // Create a mapping of belonging to colors
      const belongingColorMap = uniqueMinorStageNames.reduce(
        (acc, stageName, index) => {
          acc[stageName] = colors[index];
          return acc;
        },
        {} as Record<string, string>
      );

      // Assign colors to locations based on their belonging
      locations.forEach((location) => {
        location.color = belongingColorMap[location.minorStageName!];
      });
      return locations;
    } else {
      locations.forEach((location) => {
        delete location.color;
      });
      return locations;
    }
  } else {
    // Make symbols black again, if only one MinorStage is being shown
    locations.forEach((location) => {
      delete location.color;
    });
    return locations;
  }
}

/**
 * Gets the locations of the remaining places to visit in the specified countries, that are not connected to the shown stage
 */
export function getRemainingCountriesPlacesLocations(
  countryIds: number[],
  assignedLocations: Location[] | undefined,
  findCountriesPlaces: (countryId: number) => PlaceToVisit[] | undefined,
  showAllPlaces: boolean
): Location[] {
  if (!showAllPlaces) {
    return [];
  }

  const remainingLocations: Location[] = [];

  for (const countryId of countryIds) {
    const allPlaces = findCountriesPlaces(countryId);

    if (!allPlaces) continue;
    for (const place of allPlaces) {
      const isAlreadyAssigned = assignedLocations?.some(
        (location) =>
          location.data.name === place.name &&
          location.locationType === LocationType.placeToVisit &&
          location.data.latitude === place.latitude &&
          location.data.longitude === place.longitude
      );

      if (!isAlreadyAssigned) {
        remainingLocations.push(formatPlaceToLocation(place));
      }
    }
  }

  return remainingLocations;
}

export function formatPlaceToLocation(placeToVisit: PlaceToVisit): Location {
  return {
    belonging: 'Unknown',
    locationType: LocationType.placeToVisit,
    data: {
      name: placeToVisit.name,
      latitude: placeToVisit.latitude,
      longitude: placeToVisit.longitude,
    },
    done: placeToVisit.visited,
    description: placeToVisit.description || '',
  };
}

export function getRouteLocationsNamesFromLocations(
  locations: Location[]
): string[] {
  const filteredLocations = locations.filter(
    (location) => location.locationType === LocationType.accommodation
  );
  return filteredLocations.map((location) => location.data.name);
}

export function compareRouteLocations(
  locs1: string[],
  locs2: string[]
): boolean {
  if (locs1.length !== locs2.length) return false;

  // Check if all elements are the same
  for (let i = 0; i < locs1.length; i++) {
    if (locs1[i] !== locs2[i]) return false;
  }

  return true;
}
