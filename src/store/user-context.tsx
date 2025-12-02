import { createContext, useEffect, useState } from 'react';
import { LatLng } from 'react-native-maps';

import { CurrencyInfo } from '../models';
import { fetchCurrencies } from '../utils/http/spending';
import { FetchUserDataProps, fetchUsersData } from '../utils/http/user';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

export function useFirebaseAuth() {
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUserId(user.uid);
      } else {
        setFirebaseUserId(null);
      }
    });

    // Falls noch niemand eingeloggt ist: anonym anmelden
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.log('Firebase anonymous sign-in error', error);
      });
    }

    return unsubscribe;
  }, []);

  return firebaseUserId;
}

interface UserContextType {
  userId: number | undefined;
  currentLocation: LatLng | undefined;
  setCurrentLocation: (loc: LatLng | undefined) => void;
  timezoneoffset: number;
  localCurrency: CurrencyInfo;
  currencies: CurrencyInfo[];
  fetchUserData: (loc?: LatLng | undefined) => Promise<void | string>;
}

export const UserContext = createContext<UserContextType>({
  userId: undefined,
  currentLocation: undefined,
  setCurrentLocation: () => {},
  timezoneoffset: 0,
  localCurrency: { code: 'EUR', name: 'Euro', symbol: '€', conversionRate: 1 },
  currencies: [],
  fetchUserData: async () => {},
});

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useFirebaseAuth();
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [currentLocation, setCurrentLocation] = useState<LatLng | undefined>(
    undefined
  );
  const [timezoneoffset, setTimezoneOffset] = useState<number>(0);
  const [localCurrency, setLocalCurrency] = useState<CurrencyInfo>({
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    conversionRate: 1,
  });
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);

  async function fetchUserData(location?: LatLng): Promise<void | string> {
    let userDataResponse: FetchUserDataProps;
    if (location) {
      userDataResponse = await fetchUsersData(location);
    } else {
      userDataResponse = await fetchUsersData(currentLocation);
    }

    if (userDataResponse.error) {
      return userDataResponse.error;
    } else {
      setUserId(userDataResponse.userId);
      setTimezoneOffset(userDataResponse.offset || 0);
      setLocalCurrency({
        code: userDataResponse.localCurrency?.code || 'EUR',
        name: userDataResponse.localCurrency?.name || 'Euro',
        symbol: userDataResponse.localCurrency?.symbol || '€',
        conversionRate: userDataResponse.localCurrency?.conversionRate || 1,
      });
    }

    const currencyResponse = await fetchCurrencies();
    if (currencyResponse.error) {
      return currencyResponse.error;
    } else if (currencyResponse.currencies) {
      sortCurrencies(currencyResponse.currencies);
    }
  }

  function sortCurrencies(currencies: CurrencyInfo[]) {
    // Get standard currencies first
    const eur = currencies.filter((c) => c.code === 'EUR')[0];
    const usd = currencies.filter((c) => c.code === 'USD')[0];
    // Remove duplicates for localCurrency, EUR, USD
    const filtered = currencies.filter(
      (c) =>
        c.code !== localCurrency.code && c.code !== 'EUR' && c.code !== 'USD'
    );

    // Sort the rest alphabetically by currency
    filtered.sort((a, b) => a.code!.localeCompare(b.code!));

    // Build the final list
    const sorted = [
      localCurrency,
      localCurrency.code !== 'EUR' ? eur : undefined,
      localCurrency.code !== 'USD' ? usd : undefined,
      ...filtered,
    ].filter((c): c is CurrencyInfo => c?.code !== undefined);

    setCurrencies(sorted);
  }

  const value = {
    userId,
    currentLocation,
    setCurrentLocation,
    timezoneoffset,
    localCurrency,
    currencies,
    fetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
