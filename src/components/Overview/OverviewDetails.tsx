import { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import { Icons, Journey } from '../../models';
import {
  formatDate,
  formatDateString,
  formatDurationToDays,
  parseDate,
} from '../../utils';
import IconButton from '../UI/IconButton';

interface OverviewDetailsProps {
  journey: Journey;
}

const OverviewDetails: React.FC<OverviewDetailsProps> = ({
  journey,
}): ReactElement => {
  const moneyAvailable = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(journey.costs.budget);
  const moneyPlanned = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(journey.costs.spent_money);
  const budgetExceeded = journey.costs.spent_money > journey.costs.budget;

  const durationInDays = formatDurationToDays(
    journey.scheduled_start_time,
    journey.scheduled_end_time
  );
  let elapsedDays = formatDurationToDays(
    journey.scheduled_start_time,
    formatDate(new Date())
  );
  if (elapsedDays < 0) {
    elapsedDays = 0;
  } else if (elapsedDays > durationInDays) {
    elapsedDays = durationInDays;
  }

  let completedMajorStagesQty = 0;
  const majorStagesQty = journey.majorStages?.length || 0;
  let completedMinorStagesQty = 0;
  let minorStagesQty = 0;
  let completedPlacesToVisitQty = 0;
  let placesToVisitQty = 0;
  let completedActivitiesQty = 0;
  let activitiesQty = 0;

  if (journey.majorStages) {
    for (const majorStage of journey.majorStages) {
      parseDate(majorStage.scheduled_end_time) < new Date()
        ? (completedMajorStagesQty += 1)
        : undefined;
      minorStagesQty += majorStage.minorStages?.length || 0;
      if (majorStage.minorStages) {
        for (const minorStage of majorStage.minorStages) {
          parseDate(minorStage.scheduled_end_time) < new Date()
            ? (completedMinorStagesQty += 1)
            : undefined;
          if (minorStage.placesToVisit) {
            for (const place of minorStage.placesToVisit) {
              placesToVisitQty += 1;
              place.visited ? (completedPlacesToVisitQty += 1) : undefined;
            }
          }
          if (minorStage.activities) {
            for (const activity of minorStage.activities) {
              activitiesQty += 1;
              parseDate(minorStage.scheduled_end_time) < new Date()
                ? (completedActivitiesQty += 1)
                : undefined;
            }
          }
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.element}>
          <Text style={styles.subtitle}>Major Stages</Text>
          <Text style={styles.text}>
            {completedMajorStagesQty.toString()} / {majorStagesQty.toString()}
          </Text>
        </View>
        <View style={styles.element}>
          <Text style={styles.subtitle}>Minor Stages</Text>
          <Text style={styles.text}>
            {completedMinorStagesQty.toString()} / {minorStagesQty.toString()}
          </Text>
        </View>
        <View style={styles.element}>
          <IconButton
            icon={Icons.duration}
            onPress={() => {}}
            color={GlobalStyles.colors.grayMedium}
            containerStyle={styles.icon}
          />
          <Text style={styles.text}>
            {elapsedDays} / {durationInDays} days
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
            {completedPlacesToVisitQty.toString()} /{' '}
            {placesToVisitQty.toString()}
          </Text>
        </View>
        <View style={styles.element}>
          <IconButton
            icon={Icons.activity}
            onPress={() => {}}
            color={GlobalStyles.colors.grayMedium}
            containerStyle={styles.icon}
          />
          <Text style={styles.text}>
            {completedActivitiesQty.toString()} / {activitiesQty.toString()}
          </Text>
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
            {moneyPlanned} / {moneyAvailable}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
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
});

export default OverviewDetails;
