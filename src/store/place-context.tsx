import { createContext, useState } from 'react';

import { PlaceToVisit } from '../models';
import { fetchPlaces } from '../utils/http';

interface PlaceContextType {
  placesToVisit: PlaceToVisit[];
  fetchPlacesToVisit: () => Promise<void | string>;
  addPlace: (placeToVisit: PlaceToVisit) => void;
  toggleFavorite: (placeToVisitId: number) => void;
  toggleVisited: (placeToVisitId: number) => void;
  deletePlace: (placesToVisitId: number) => void;
  updatePlace: (placeToVisit: PlaceToVisit) => void;
  getPlacesByCountry: (countryId: number) => PlaceToVisit[];
}

export const PlaceContext = createContext<PlaceContextType>({
  placesToVisit: [],
  fetchPlacesToVisit: async () => {},
  addPlace: () => {},
  toggleFavorite: () => {},
  toggleVisited: () => {},
  deletePlace: () => {},
  updatePlace: () => {},
  getPlacesByCountry: () => [],
});

export default function PlaceContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [placesToVisit, setPlacesToVisit] = useState<PlaceToVisit[]>([]);

  async function fetchPlacesToVisit(): Promise<void | string> {
    const response = await fetchPlaces();

    if (!response.error) {
      setPlacesToVisit(response.places || []);
    } else {
      return response.error;
    }
  }

  function addPlace(place: PlaceToVisit) {
    setPlacesToVisit((prevPlaces) => [...prevPlaces, place]);
  }

  function toggleFavorite(placeId: number) {
    setPlacesToVisit((prevPlaces) =>
      prevPlaces.map((place) =>
        place.id === placeId ? { ...place, favorite: !place.favorite } : place
      )
    );
  }

  function toggleVisited(placeId: number) {
    setPlacesToVisit((prevPlaces) =>
      prevPlaces.map((place) =>
        place.id === placeId ? { ...place, visited: !place.visited } : place
      )
    );
  }

  function deletePlace(placesToVisitId: number) {
    setPlacesToVisit((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== placesToVisitId)
    );
  }

  function updatePlace(updatedPlace: PlaceToVisit) {
    setPlacesToVisit((prevPlaces) =>
      prevPlaces.map((place) =>
        place.id === updatedPlace.id ? updatedPlace : place
      )
    );
  }

  function getPlacesByCountry(countryId: number) {
    const foundPlaces = placesToVisit.filter(
      (place) => place.countryId === countryId
    );
    return foundPlaces;
  }

  const value = {
    placesToVisit,
    fetchPlacesToVisit,
    addPlace,
    toggleFavorite,
    toggleVisited,
    deletePlace,
    updatePlace,
    getPlacesByCountry,
  };

  return (
    <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>
  );
}
