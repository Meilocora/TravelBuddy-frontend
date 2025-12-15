import { ReactElement, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { GlobalStyles } from '../../constants/styles';
import { ButtonMode, ColorScheme, Icons, Journey } from '../../models';
import { formatDate, formatDurationToDays, parseEndDate } from '../../utils';
import IconButton from '../UI/IconButton';
import { CustomCountryContext } from '../../store/custom-country-context';
import Button from '../UI/Button';
import { MediumContext } from '../../store/medium-context';

interface UserStatsProps {
  journeys: Journey[];
  toggleVisivility: () => void;
  isVisible: boolean;
}

const UserStats: React.FC<UserStatsProps> = ({
  journeys,
  toggleVisivility,
  isVisible,
}): ReactElement => {
  const customCountryCtx = useContext(CustomCountryContext);
  const mediumCtx = useContext(MediumContext);

  const totalBudget = journeys.reduce(
    (sum, journey) => sum + (journey.costs?.budget || 0),
    0
  );

  const formattedTotalBudget = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalBudget);

  const totalMoneySpent = journeys.reduce(
    (sum, journey) => sum + (journey.costs?.spent_money || 0),
    0
  );
  const formattedTotalMoneySpent = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalMoneySpent);

  const budgetExceeded = totalMoneySpent > totalBudget;

  let completedTraveldays = 0;
  let plannedTravelDays = 0;
  let completedJourneys = 0;
  let plannedJourneys = 0;
  const countriesList: string[] = [];
  const visitedCountriesList: string[] = [];
  let completedMajorStages = 0;
  let plannedMajorStages = 0;
  let completedMinorStages = 0;
  let plannedMinorStages = 0;
  const media = mediumCtx.media.length;

  for (const journey of journeys) {
    journey.countries.forEach((country) => {
      countriesList.push(country.name);
    });

    const durationInDays = formatDurationToDays(
      journey.scheduled_start_time,
      journey.scheduled_end_time
    );
    let elapsedDays = formatDurationToDays(
      journey.scheduled_start_time,
      formatDate(new Date())
    );

    if (elapsedDays >= durationInDays) {
      completedTraveldays += durationInDays;
    } else if (elapsedDays > 0) {
      completedTraveldays += elapsedDays;
    }
    plannedTravelDays += durationInDays;
    plannedJourneys += 1;

    parseEndDate(journey.scheduled_end_time) < new Date()
      ? (completedJourneys += 1)
      : undefined;

    if (!journey.majorStages) {
      continue;
    }

    plannedMajorStages += journey.majorStages.length;

    for (const majorStage of journey.majorStages) {
      if (parseEndDate(majorStage.scheduled_end_time) < new Date()) {
        completedMajorStages += 1;
        visitedCountriesList.push(majorStage.country.name);
      }
      if (!majorStage.minorStages) {
        continue;
      }

      plannedMinorStages += majorStage.minorStages.length;
      for (const minorStage of majorStage.minorStages) {
        parseEndDate(minorStage.scheduled_end_time) < new Date()
          ? (completedMinorStages += 1)
          : undefined;
      }
    }
  }

  const uniqueVisitedCountries = [...new Set(visitedCountriesList)];
  const uniqueCountries = [...new Set(countriesList)];

  const visitedCountries = uniqueVisitedCountries.length;
  const plannedCountries = uniqueCountries.length;

  let plannedPlacesToVisit = 0;
  let visitedPlaces = 0;
  const customCountries = customCountryCtx.customCountries;
  if (customCountries) {
    for (const customCountry of customCountries) {
      if (!customCountry.placesToVisit) {
        continue;
      }
      for (const place of customCountry.placesToVisit) {
        plannedPlacesToVisit += 1;
        place.visited ? (visitedPlaces += 1) : undefined;
      }
    }
  }

  return (
    <View style={styles.container}>
      {isVisible ? (
        <Animated.View
          entering={SlideInUp.duration(500)}
          exiting={SlideOutUp.duration(250)}
        >
          <Text style={styles.title}>Stats</Text>
          <View style={styles.innerContainer}>
            <View style={styles.element}>
              <IconButton
                icon={Icons.duration}
                onPress={() => {}}
                color={GlobalStyles.colors.grayMedium}
                containerStyle={styles.icon}
              />
              <Text style={styles.text}>
                {completedTraveldays.toString()} /{' '}
                {plannedTravelDays.toString()} days
              </Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.subtitle}>Visited Countries</Text>
              <Text style={styles.text}>
                {visitedCountries.toString()} / {plannedCountries.toString()}
              </Text>
            </View>
            <View style={styles.element}>
              <IconButton
                icon={Icons.location}
                onPress={() => {}}
                color={GlobalStyles.colors.grayMedium}
                containerStyle={styles.icon}
              />
              <Text style={styles.text}>
                {visitedPlaces.toString()} / {plannedPlacesToVisit.toString()}
              </Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.subtitle}>Journeys</Text>
              <Text style={styles.text}>
                {completedJourneys.toString()} / {plannedJourneys.toString()}
              </Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.subtitle}>Major Stages</Text>
              <Text style={styles.text}>
                {completedMajorStages.toString()} /{' '}
                {plannedMajorStages.toString()}
              </Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.subtitle}>Minor Stages</Text>
              <Text style={styles.text}>
                {completedMinorStages.toString()} /{' '}
                {plannedMinorStages.toString()}
              </Text>
            </View>
            <View style={styles.element}>
              <IconButton
                icon={Icons.images}
                onPress={() => {}}
                color={GlobalStyles.colors.grayMedium}
                containerStyle={styles.icon}
              />
              <Text style={styles.text}>{media}</Text>
            </View>
            <View style={styles.element}>
              <IconButton
                icon={Icons.currency}
                onPress={() => {}}
                color={
                  budgetExceeded
                    ? GlobalStyles.colors.error200
                    : GlobalStyles.colors.grayMedium
                }
                containerStyle={styles.icon}
              />
              <Text style={[styles.text, budgetExceeded && styles.errorText]}>
                {formattedTotalMoneySpent} / {formattedTotalBudget}
              </Text>
            </View>
          </View>

          <Button
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
            onPress={toggleVisivility}
            style={styles.button}
          >
            Hide Stats
          </Button>
        </Animated.View>
      ) : (
        <Button
          colorScheme={ColorScheme.neutral}
          mode={ButtonMode.flat}
          onPress={toggleVisivility}
          style={styles.button}
        >
          Show Stats
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
    marginTop: 5,
  },
  title: {
    fontSize: 22,
    textDecorationLine: 'underline',
    color: GlobalStyles.colors.grayDark,
    textAlign: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    marginHorizontal: 'auto',
  },
  element: {
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    width: '40%',
    borderColor: GlobalStyles.colors.grayDark,
    borderWidth: 0.75,
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GlobalStyles.colors.grayMedium,
  },
  text: {
    color: GlobalStyles.colors.grayDark,
  },
  errorText: {
    color: GlobalStyles.colors.error200,
  },
  icon: {
    marginVertical: 0,
    paddingVertical: 0,
  },
  button: { alignSelf: 'center' },
});

export default UserStats;
