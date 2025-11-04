import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';

import {
  ColorScheme,
  Icons,
  JourneyBottomTabsParamsList,
  MajorStageStackParamList,
} from '../../../models';
import IconButton from '../../../components/UI/IconButton';
import Popup from '../../../components/UI/Popup';
import ComplementaryGradient from '../../../components/UI/LinearGradients/ComplementaryGradient';
import { GlobalStyles } from '../../../constants/styles';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import MinorStageList from '../../../components/MinorStage/MinorStageList';
import { validateIsOver } from '../../../utils';
import InfoText from '../../../components/UI/InfoText';
import ErrorOverlay from '../../../components/UI/ErrorOverlay';
import { StagesContext } from '../../../store/stages-context';
import HeaderTitle from '../../../components/UI/HeaderTitle';

interface MinorStagesProps {
  navigation: NativeStackNavigationProp<
    MajorStageStackParamList,
    'MinorStages'
  >;
  route: RouteProp<MajorStageStackParamList, 'MinorStages'>;
}

const MinorStages: React.FC<MinorStagesProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [popupText, setPopupText] = useState<string | null>();
  let { majorStageId, journeyId } = route.params;

  const stagesCtx = useContext(StagesContext);
  const majorStage = stagesCtx.findMajorStage(majorStageId);

  const planningNavigation =
    useNavigation<BottomTabNavigationProp<JourneyBottomTabsParamsList>>();

  // Hide tab bar when navigating to this screen
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });
    // return () =>
    // navigation.getParent()?.setOptions({
    // tabBarStyle: { backgroundColor: GlobalStyles.colors.greenBg },
    // });
  }, [navigation]);

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

  function handleAddMinorStage() {
    navigation.navigate('ManageMinorStage', {
      journeyId: journeyId,
      majorStageId: majorStageId,
    });
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={majorStage!.title} />,
      headerRight: () => (
        <IconButton
          icon={Icons.add}
          onPress={handleAddMinorStage}
          color={GlobalStyles.colors.grayDark}
          size={32}
        />
      ),
      headerLeft: ({}) => (
        <IconButton
          color={GlobalStyles.colors.grayDark}
          size={24}
          icon={Icons.arrowBack}
          onPress={() => {
            planningNavigation.navigate('Planning', {
              journeyId: journeyId!,
            });
          }}
        />
      ),
      headerStyle: { backgroundColor: GlobalStyles.colors.purpleBg },
    });
  }, [navigation, majorStage]);

  let content;

  if (isFetching) {
    content = <InfoText content='Loading Minor Stages...' />;
  } else if (majorStage!.minorStages?.length === 0 && !error) {
    content = <InfoText content='No Minor Stages found!' />;
  } else {
    content = (
      <MinorStageList
        majorStage={majorStage!}
        minorStages={majorStage?.minorStages!}
      />
    );
  }

  if (error) {
    return (
      <>
        <ComplementaryGradient />
        <ErrorOverlay
          message={error}
          onPress={handlePressReload}
          buttonText='Reload'
        />
      </>
    );
  }

  return (
    <>
      <ComplementaryGradient />
      <View style={styles.root}>
        {popupText && (
          <Popup
            content={popupText}
            onClose={handleClosePopup}
            colorScheme={ColorScheme.complementary}
          />
        )}
        {content}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default MinorStages;
