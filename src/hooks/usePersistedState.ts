import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initialen value
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored !== null) {
          setState(JSON.parse(stored));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [key]);

  // save bei jeder Änderung
  useEffect(() => {
    if (!isLoaded) return; // Verhindere Speichern vor dem initialen Laden
    (async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error saving ${key}:`, error);
      }
    })();
  }, [key, state, isLoaded]);

  return [state, setState];
}
