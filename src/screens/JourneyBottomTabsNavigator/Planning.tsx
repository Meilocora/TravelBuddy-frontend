import {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';

import { ColorScheme, Icons, JourneyBottomTabsParamsList } from '../../models';
import MajorStageList from '../../components/MajorStage/MajorStageList';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconButton from '../../components/UI/IconButton';
import Popup from '../../components/UI/Popup';
import InfoText from '../../components/UI/InfoText';
import ErrorOverlay from '../../components/UI/ErrorOverlay';
import { parseDate, validateIsOver } from '../../utils';
import { StagesContext } from '../../store/stages-context';

interface PlanningProps {
  navigation: NativeStackNavigationProp<
    JourneyBottomTabsParamsList,
    'Planning'
  >;
  route: RouteProp<JourneyBottomTabsParamsList, 'Planning'>;
}

const Planning: React.FC<PlanningProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [popupText, setPopupText] = useState<string | null>();
  let { journeyId } = route.params;
  const stagesCtx = useContext(StagesContext);
  const journey = stagesCtx.findJourney(journeyId);

  const isOver = validateIsOver(journey!.scheduled_end_time);

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
    setError(null);
    setRefresh((prev) => prev + 1);
  }

  function handleAddMajorStage() {
    navigation.navigate('MajorStageStackNavigator', {
      screen: 'ManageMajorStage',
      params: { journeyId: journeyId },
    });
  }

  useLayoutEffect(() => {
    if (!isOver) {
      navigation.setOptions({
        title: journey?.name,
        headerRight: () => (
          <IconButton
            icon={Icons.add}
            onPress={handleAddMajorStage}
            color={'white'}
            size={32}
          />
        ),
      });
    } else {
      navigation.setOptions({
        title: journey?.name,
      });
    }
  }, [navigation, journey]);

  let content;

  if (isFetching) {
    content = <InfoText content='Loading Major Stages...' />;
  } else if (journey!.majorStages?.length === 0 && !error) {
    content = <InfoText content='No Major Stages found!' />;
  } else if (journey?.majorStages) {
    content = (
      <MajorStageList journey={journey} majorStages={journey.majorStages} />
    );
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
      {popupText && (
        <Popup
          content={popupText}
          onClose={handleClosePopup}
          colorScheme={ColorScheme.accent}
        />
      )}
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default Planning;
