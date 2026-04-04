import React, {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import JourneysList from '../../components/Journeys/JourneysList';
import ErrorOverlay from '../../components/UI/ErrorOverlay';
import { BottomTabsParamList, Icons, StackParamList } from '../../models';
import Popup from '../../components/UI/Popup';
import { StagesContext } from '../../store/stages-context';
import CurrentElementList from '../../components/CurrentElements/CurrentElementList';
import { GlobalStyles } from '../../constants/styles';
import Animated from 'react-native-reanimated';
import { useAppData } from '../../hooks/useAppData';
import FloatingButton from '../../components/UI/FloatingButton';
import IconButton from '../../components/UI/IconButton';

interface AllJourneysProps {
  navigation: NativeStackNavigationProp<BottomTabsParamList, 'AllJourneys'>;
  route: RouteProp<BottomTabsParamList, 'AllJourneys'>;
}

const AllJourneys: React.FC<AllJourneysProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [popupText, setPopupText] = useState<string | null>();
  const { isFetching, errors, triggerRefresh } = useAppData({
    autoFetch: true,
  });
  const stagesCtx = useContext(StagesContext);

  const manageJourneyNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

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

  function handleAddJourney() {
    manageJourneyNavigation.navigate('ManageJourney', { journeyId: undefined });
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          {/* <IconButton icon={Icons.currency} onPress={() => {}} size={24} /> */}
          <IconButton
            color={GlobalStyles.colors.grayDark}
            size={24}
            icon={Icons.person}
            onPress={() => {
              navigation.navigate('UserProfile');
            }}
          />
        </View>
      ),
    });
  }, [navigation]);

  let content;
  if (isFetching) {
    content = (
      <Animated.View style={styles.indicator}>
        <ActivityIndicator
          size={80}
          color={GlobalStyles.colors.greenAccent}
          style={styles.indicator}
        />
      </Animated.View>
    );
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
      <FloatingButton onPress={handleAddJourney} icon={Icons.add} />
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
