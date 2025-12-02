import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import JourneysList from '../../components/Journeys/JourneysList';
import ErrorOverlay from '../../components/UI/ErrorOverlay';
import { BottomTabsParamList } from '../../models';
import Popup from '../../components/UI/Popup';
import InfoText from '../../components/UI/InfoText';
import { StagesContext } from '../../store/stages-context';
import CurrentElementList from '../../components/CurrentElements/CurrentElementList';
import { GlobalStyles } from '../../constants/styles';
import Animated from 'react-native-reanimated';
import { useAppData } from '../../hooks/useAppData';

interface AllJourneysProps {
  navigation: NativeStackNavigationProp<BottomTabsParamList, 'AllJourneys'>;
  route: RouteProp<BottomTabsParamList, 'AllJourneys'>;
}

const AllJourneys: React.FC<AllJourneysProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [popupText, setPopupText] = useState<string | null>();
  const { isFetching, errors, triggerRefresh } = useAppData();
  const stagesCtx = useContext(StagesContext);

  useEffect(() => {
    function activatePopup() {
      if (route.params?.popupText) {
        setPopupText(route.params?.popupText);
      }
    }
    activatePopup();
  }, [route.params]);

  function handleClosePopup() {
    setPopupText(null);
  }

  function handlePressReload() {
    triggerRefresh();
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
  } else if (stagesCtx.journeys.length === 0 && errors.length === 0) {
    content = <InfoText content='No Journeys found!' />;
  } else {
    content = (
      <JourneysList
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={triggerRefresh}
            colors={[GlobalStyles.colors.greenAccent]}
            tintColor={GlobalStyles.colors.greenAccent}
          />
        }
      />
    );
  }

  if (errors.length > 0) {
    return (
      <ErrorOverlay
        message={errors.join('\n')}
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
