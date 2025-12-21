import { View, Pressable, StyleSheet } from 'react-native';
import { ReactElement, useContext, useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { CustomCountry, Icons, Journey } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import {
  formatAmount,
  formatDateString,
  formatDurationToDays,
  validateIsOver,
} from '../../utils';
import CustomProgressBar from '../UI/CustomProgressBar';
import { StackParamList } from '../../models';
import ElementTitle from '../UI/list/ElementTitle';
import DetailArea, { ElementDetailInfo } from '../UI/list/DetailArea';
import IconButton from '../UI/IconButton';
import ElementComment from '../UI/list/ElementComment';
import { StagesContext } from '../../store/stages-context';
import CountryElement from '../UI/CountryElement';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MediumContext } from '../../store/medium-context';
import LocalMediaList from '../Images/LocalMediaList';

interface JourneyListElementProps {
  journey: Journey;
}

const JourneyListElement: React.FC<JourneyListElementProps> = ({
  journey,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);
  const mediumCtx = useContext(MediumContext);

  const [showMedia, setshowMedia] = useState(false);

  const moneyAvailable = formatAmount(journey.costs.budget);
  const moneyPlanned = formatAmount(journey.costs.spent_money);
  const startDate = formatDateString(journey.scheduled_start_time);
  const endDate = formatDateString(journey.scheduled_end_time);
  const durationInDays = formatDurationToDays(
    journey.scheduled_start_time,
    journey.scheduled_end_time
  );
  const majorStagesQty = journey.majorStages?.length || 0;
  let currentCountry: string;
  let countryList: CustomCountry[] = [];
  let minorStagesQty = 0;
  let minorStageIds: number[] = [];
  if (journey.majorStages) {
    for (const majorStage of journey.majorStages) {
      minorStagesQty += majorStage.minorStages?.length || 0;
      majorStage.minorStages &&
        minorStageIds.push(...majorStage.minorStages.map((s) => s.id));
      if (!countryList.some((c) => c.id === majorStage.country.id)) {
        countryList.push(majorStage.country);
      }
      if (majorStage.currentMajorStage) {
        currentCountry = majorStage.country.name;
      }
    }
  }

  for (const country of journey.countries) {
    if (!countryList.some((c) => c.name == country.name)) {
      countryList.push(country);
    }
  }

  const isOver = validateIsOver(journey.scheduled_end_time);
  const hasMedia = mediumCtx.hasMedia('MinorStages', undefined, minorStageIds);

  const elementDetailInfo: ElementDetailInfo[] = [
    { icon: Icons.duration, value: `${durationInDays} days` },
    {
      icon: Icons.currency,
      value: `${moneyPlanned} / ${moneyAvailable}`,
      textStyle: journey.costs.money_exceeded
        ? { color: GlobalStyles.colors.error200 }
        : undefined,
    },
    { title: 'Major Stages', value: majorStagesQty.toString() },
    { title: 'Minor Stages', value: minorStagesQty.toString() },
  ];

  const navigationJourneyBottomTabs =
    useNavigation<NavigationProp<StackParamList>>();

  function handleOnPress() {
    stagesCtx.setSelectedJourneyId(journey.id);
    navigationJourneyBottomTabs.navigate('JourneyBottomTabsNavigator', {
      screen: 'Planning',
      params: { journeyId: journey.id },
    });
  }

  const manageJourneyNavigation =
    useNavigation<BottomTabNavigationProp<StackParamList>>();

  function handleEdit() {
    manageJourneyNavigation.navigate('ManageJourney', {
      journeyId: journey.id,
    });
  }

  return (
    <>
      <LocalMediaList
        visible={showMedia}
        handleClose={() => setshowMedia(false)}
        minorStageIds={minorStageIds}
      />
      <View
        style={[
          styles.outerContainer,
          isOver && styles.inactiveOuterContainer,
          journey.currentJourney && styles.currentOuterContainer,
        ]}
      >
        <View style={styles.buttonsContainer}>
          <IconButton
            icon={Icons.edit}
            color={GlobalStyles.colors.greenAccent}
            onPress={handleEdit}
            containerStyle={styles.button}
          />
          {hasMedia && (
            <IconButton
              icon={Icons.images}
              color={GlobalStyles.colors.greenAccent}
              onPress={() => setshowMedia(true)}
              containerStyle={styles.button}
            />
          )}
        </View>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          android_ripple={{ color: GlobalStyles.colors.greenAccent }}
          onPress={handleOnPress}
        >
          <View style={styles.innerContainer}>
            <View style={styles.headerContainer}>
              <ElementTitle>{journey.name}</ElementTitle>
            </View>
            <ElementComment content={`${startDate} - ${endDate}`} />
            <DetailArea elementDetailInfo={elementDetailInfo} />
            <View style={styles.countryRow}>
              {countryList.map((country, index) => (
                <CountryElement
                  country={country}
                  currentCountry={country.name === currentCountry}
                  isLast={index === journey.countries.length - 1}
                  key={`${country.id}+${journey.id}`}
                />
              ))}
            </View>
          </View>
          {/* <CustomProgressBar
            startDate={journey.scheduled_start_time}
            endDate={journey.scheduled_end_time}
          /> */}
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    borderColor: GlobalStyles.colors.greenDark,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderRadius: 6,
    marginVertical: 8,
    marginHorizontal: 32,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    elevation: 5,
    shadowColor: GlobalStyles.colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  currentOuterContainer: {
    borderColor: 'gold',
    elevation: 10,
    shadowColor: 'gold',
  },
  inactiveOuterContainer: {
    borderColor: GlobalStyles.colors.grayMedium,
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.5,
  },
  innerContainer: {
    backgroundColor: GlobalStyles.colors.greenSoft,
    padding: 10,
    alignItems: 'center',
  },
  headerContainer: {
    flex: 1,
    width: '85%',
    marginRight: '10%',
    justifyContent: 'center',
  },
  buttonsContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    zIndex: 1,
    right: 0,
    top: 0,
    marginTop: 10,
  },
  button: {
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 0,
  },
  countryRow: {
    maxHeight: 60,
    marginVertical: 4,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default JourneyListElement;
