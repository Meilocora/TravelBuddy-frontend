import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import JourneysList from '../../components/Journeys/JourneysList';
import ErrorOverlay from '../../components/UI/ErrorOverlay';
import { BottomTabsParamList } from '../../models';
import Popup from '../../components/UI/Popup';
import InfoText from '../../components/UI/InfoText';
import { AuthContext } from '../../store/auth-context';
import { StagesContext } from '../../store/stages-context';
import { CustomCountryContext } from '../../store/custom-country-context';
import CurrentElementList from '../../components/CurrentElements/CurrentElementList';
import { PlaceContext } from '../../store/place-context';
import {
  getCurrentLocation,
  useLocationPermissions,
} from '../../utils/location';
import { UserContext } from '../../store/user-context';
import { GlobalStyles } from '../../constants/styles';
import { LatLng } from 'react-native-maps';
import Animated from 'react-native-reanimated';

interface AllJourneysProps {
  navigation: NativeStackNavigationProp<BottomTabsParamList, 'AllJourneys'>;
  route: RouteProp<BottomTabsParamList, 'AllJourneys'>;
}

const AllJourneys: React.FC<AllJourneysProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [popupText, setPopupText] = useState<string | null>();

  const { verifyPermissions } = useLocationPermissions();

  const userCtx = useContext(UserContext);
  const authCtx = useContext(AuthContext);
  const stagesCtx = useContext(StagesContext);
  const countryCtx = useContext(CustomCountryContext);
  const placesCtx = useContext(PlaceContext);

  useEffect(() => {
    function activatePopup() {
      if (route.params?.popupText) {
        setPopupText(route.params?.popupText);
      }
    }
    activatePopup();
  }, [route.params]);

  // Fetch all data here, because the users always starts on this screen
  useEffect(() => {
    async function getData() {
      setIsFetching(true);
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

      if (userInfoBackendError) {
        setError(userInfoBackendError);
      } else if (userBackendError) {
        setError(userBackendError);
      } else if (stagesBackendError) {
        setError(stagesBackendError);
      } else if (countriesBackendError) {
        setError(countriesBackendError);
      } else if (placesBackendError) {
        setError(placesBackendError);
      }
      setIsFetching(false);
    }

    getData();
  }, [refresh]);

  function handleClosePopup() {
    setPopupText(null);
  }

  function handlePressReload() {
    setError(null);
    setRefresh((prev) => prev + 1);
  }

  let content;
  if (isFetching) {
    content = (
      <Animated.View style={styles.indicator}>
        <ActivityIndicator
          size='large'
          color={GlobalStyles.colors.greenAccent}
          style={styles.indicator}
        />
      </Animated.View>
    );
  } else if (stagesCtx.journeys.length === 0 && !error) {
    content = <InfoText content='No Journeys found!' />;
  } else {
    content = <JourneysList />;
  }

  if (error) {
    return (
      <ErrorOverlay
        message={error}
        onPress={handlePressReload}
        buttonText='Reload'
      />
    );
  }

  return (
    <View style={styles.root}>
      <CurrentElementList />
      {popupText && <Popup content={popupText} onClose={handleClosePopup} />}
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  indicator: {
    marginVertical: 'auto',
  },
});

export default AllJourneys;
