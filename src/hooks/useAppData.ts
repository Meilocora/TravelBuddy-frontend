import { useContext, useEffect, useState } from 'react';
import { LatLng } from 'react-native-maps';

import { AuthContext } from '../store/auth-context';
import { StagesContext } from '../store/stages-context';
import { CustomCountryContext } from '../store/custom-country-context';
import { PlaceContext } from '../store/place-context';
import { UserContext } from '../store/user-context';
import { getCurrentLocation, useLocationPermissions } from '../utils/location';
import { MediumContext } from '../store/medium-context';

export function useAppData(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? false;

  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(0);

  const { verifyPermissions } = useLocationPermissions();

  const userCtx = useContext(UserContext);
  const authCtx = useContext(AuthContext);
  const stagesCtx = useContext(StagesContext);
  const countryCtx = useContext(CustomCountryContext);
  const placesCtx = useContext(PlaceContext);
  const mediumCtx = useContext(MediumContext);

  useEffect(() => {
    // Prevent automatic fetch on initial render if autoFetch is false
    if (!autoFetch && refresh === 0) return;

    async function getData() {
      setIsFetching(true);
      setErrors([]);
      const collectedErrors: string[] = [];

      try {
        const hasPermission = await verifyPermissions();
        let currentLocation: LatLng | undefined;
        if (hasPermission) {
          currentLocation = await getCurrentLocation();
          userCtx.setCurrentLocation(currentLocation);
        }

        const userInfoBackendError = await authCtx.fetchUserInfo();
        const userBackendError = await userCtx.fetchUserData(
          currentLocation || undefined
        );
        const stagesBackendError = await stagesCtx.fetchStagesData();
        const countriesBackendError =
          await countryCtx.fetchUsersCustomCountries();
        const placesBackendError = await placesCtx.fetchPlacesToVisit();
        const mediaBackendError = await mediumCtx.fetchMedia();

        if (userInfoBackendError) collectedErrors.push(userInfoBackendError);
        if (userBackendError) collectedErrors.push(userBackendError);
        if (stagesBackendError) collectedErrors.push(stagesBackendError);
        if (countriesBackendError) collectedErrors.push(countriesBackendError);
        if (placesBackendError) collectedErrors.push(placesBackendError);
        if (mediaBackendError) collectedErrors.push(mediaBackendError);

        setErrors(collectedErrors);
      } catch (err) {
        collectedErrors.push('Unexpected error while fetching data');
        setErrors(collectedErrors);
      }

      setIsFetching(false);
    }

    getData();
  }, [refresh, autoFetch]);

  const triggerRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  return {
    isFetching,
    errors,
    triggerRefresh,
  };
}
