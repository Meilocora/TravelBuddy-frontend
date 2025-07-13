import { createContext, useState } from 'react';

import { CustomCountry, PlaceToVisit } from '../models';
import { fetchCustomCountries } from '../utils/http/custom_country';

interface CustomCountryContextType {
  customCountries: CustomCountry[];
  fetchUsersCustomCountries: () => Promise<void | string>;
  addCustomCountry: (customCountry: CustomCountry) => void;
  deleteCustomCountry: (customCountryId: number) => void;
  updateCustomCountry: (customCountry: CustomCountry) => void;
  findCountriesPlaces: (countryId: number) => PlaceToVisit[] | undefined;
}

export const CustomCountryContext = createContext<CustomCountryContextType>({
  customCountries: [],
  fetchUsersCustomCountries: async () => {},
  addCustomCountry: () => {},
  deleteCustomCountry: () => {},
  updateCustomCountry: () => {},
  findCountriesPlaces: () => undefined,
});

export default function CustomCountryContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customCountries, setCustomCountries] = useState<CustomCountry[]>([]);

  function addCustomCountry(customCountry: CustomCountry) {
    setCustomCountries((prevCustomCountries) => [
      ...prevCustomCountries,
      customCountry,
    ]);
  }

  function deleteCustomCountry(customCountryId: number) {
    setCustomCountries((prevCustomCountries) =>
      prevCustomCountries.filter(
        (customCountry) => customCountry.id !== customCountryId
      )
    );
  }

  function updateCustomCountry(updatedCustomCountry: CustomCountry) {
    setCustomCountries((prevCustomCountries) =>
      prevCustomCountries.map((customCountry) =>
        customCountry.id === updatedCustomCountry.id
          ? updatedCustomCountry
          : customCountry
      )
    );
  }

  async function fetchUsersCustomCountries(): Promise<void | string> {
    const response = await fetchCustomCountries();

    if (response.data) {
      setCustomCountries(response.data);
    }
    {
      return response.error;
    }
  }

  function findCountriesPlaces(countryId: number) {
    if (countryId === 0) {
      return undefined;
    }

    const placesToVisit = [];

    for (const country of customCountries) {
      if (country.id === countryId) {
        for (const place of country.placesToVisit || []) {
          placesToVisit.push(place);
        }
      }
    }
    return placesToVisit.length > 0 ? placesToVisit : undefined;
  }

  const value = {
    customCountries,
    fetchUsersCustomCountries,
    addCustomCountry,
    deleteCustomCountry,
    updateCustomCountry,
    findCountriesPlaces,
  };

  return (
    <CustomCountryContext.Provider value={value}>
      {children}
    </CustomCountryContext.Provider>
  );
}
