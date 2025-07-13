import { ReactElement, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { Indicators, StagesContext } from '../../store/stages-context';
import {
  formatAmount,
  formatCountdown,
  formatCountdownDays,
  formatDuration,
  parseDate,
} from '../../utils';
import CurrentElement from './CurrentElement';
import {
  ColorScheme,
  Location,
  LocationType,
  StackParamList,
  TransportationType,
} from '../../models';
import { UserContext } from '../../store/user-context';

interface CurrentElementListProps {}

const CurrentElementList: React.FC<
  CurrentElementListProps
> = (): ReactElement => {
  const journeyNavigation = useNavigation<NavigationProp<StackParamList>>();
  const mapNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  const userCtx = useContext(UserContext);
  const stagesCtx = useContext(StagesContext);

  const currentJourney = stagesCtx.journeys.find(
    (journey) => journey.currentJourney
  );
  const nextJourney = stagesCtx.findNextJourney();

  const currentMinorStage = stagesCtx.findCurrentMinorStage();
  const currentMajorStage = stagesCtx.findMinorStagesMajorStage(
    currentMinorStage?.id || 1
  );
  const nextTransportation = stagesCtx.findNextTransportation();
  const connectedStage = stagesCtx.findTransportationsStage(
    nextTransportation?.id || 0
  );
  const transportationStageType =
    connectedStage && 'country' in connectedStage ? 'accent' : 'complementary';

  let content: ReactElement = <></>;

  function handleGoToNextJourney() {
    stagesCtx.setSelectedJourneyId(nextJourney!.id);
    journeyNavigation.navigate('JourneyBottomTabsNavigator', {
      screen: 'Planning',
      params: { journeyId: nextJourney!.id },
    });
  }

  function handleGoToMinorStage() {
    journeyNavigation.navigate('JourneyBottomTabsNavigator', {
      screen: 'MajorStageStackNavigator',
      params: {
        screen: 'MinorStages',
        params: {
          journeyId: currentJourney!.id,
          majorStageId: currentMajorStage!.id,
        },
      },
    });
  }

  function handleShowAccommodation() {
    const location: Location = {
      belonging: 'Undefined',
      locationType: LocationType.accommodation,
      data: {
        name: currentMinorStage?.accommodation.place || '',
        latitude: currentMinorStage?.accommodation.latitude!,
        longitude: currentMinorStage?.accommodation.longitude!,
      },
      done: currentMinorStage
        ? parseDate(currentMinorStage.scheduled_end_time) < new Date()
        : false,
    };

    mapNavigation.navigate('ShowMap', {
      location: location,
      colorScheme: 'complementary',
    });
  }

  function handleShowTransportation() {
    const location: Location = {
      belonging: 'Undefined',
      locationType: LocationType.transportation_departure,
      transportationType: nextTransportation!.type as TransportationType,
      data: {
        name: nextTransportation?.type || '',
        latitude: nextTransportation?.departure_latitude!,
        longitude: nextTransportation?.departure_longitude!,
      },
      done: nextTransportation
        ? parseDate(nextTransportation.start_time) < new Date()
        : false,
    };

    mapNavigation.navigate('ShowMap', {
      location: location,
      colorScheme: transportationStageType,
    });
  }

  if (!currentJourney) {
    if (nextJourney) {
      const countDown = formatCountdownDays(nextJourney!.scheduled_start_time);
      const description = `Starts in ${countDown} days`;

      content = (
        <CurrentElement
          title={nextJourney!.name}
          subtitle='Next Journey'
          description={description}
          indicator={Indicators.nextJourney}
          onPress={handleGoToNextJourney}
        />
      );
    }
  } else {
    const duration = formatCountdownDays(currentMinorStage?.scheduled_end_time);
    const countDownTransportation = formatCountdown(
      nextTransportation?.start_time,
      nextTransportation?.start_time_offset!,
      userCtx.timezoneoffset
    );
    const durationTransportation = formatDuration(
      nextTransportation?.start_time,
      nextTransportation?.start_time_offset,
      nextTransportation?.arrival_time,
      nextTransportation?.arrival_time_offset
    );
    content = (
      <>
        {currentMinorStage && (
          <>
            <CurrentElement
              title={`"${currentMinorStage!.title}"`}
              subtitle='Current Minor Stage'
              description={`${
                currentMajorStage!.country.name
              } for ${duration} days`}
              indicator={Indicators.currentMinorStage}
              onPress={handleGoToMinorStage}
              colorScheme={ColorScheme.complementary}
            />
            {currentMinorStage.accommodation.place !== '' && (
              <CurrentElement
                title={`"${currentMinorStage!.accommodation.place}"`}
                subtitle='Current Accommodation'
                description={formatAmount(
                  currentMinorStage.accommodation.costs
                )}
                indicator={Indicators.currentAccommodation}
                onPress={handleShowAccommodation}
                colorScheme={ColorScheme.complementary}
              />
            )}
          </>
        )}
        {nextTransportation && (
          <CurrentElement
            title={`${nextTransportation.type} (${durationTransportation})`}
            subtitle='Next Transportation'
            description={`In ${countDownTransportation}`}
            indicator={Indicators.nextTransportation}
            onPress={handleShowTransportation}
            colorScheme={transportationStageType as ColorScheme}
          />
        )}
      </>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 5,
    zIndex: 2,
  },
});

export default CurrentElementList;
