import {
  Journey,
  MajorStage,
  MajorStageFormValues,
  MinorStageFormValues,
} from '../models';
import { formatDate, parseDate } from './formatting';

export function calculateDatesForMajorStage(
  journey: Journey,
  majorStageFormValues: MajorStageFormValues,
  initialPosition: number,
): [string, string] {
  let startDate = '';
  let endDate = '';

  if (majorStageFormValues) {
    // if (majorStageFormValues.position.value > 1) {
    if (initialPosition > 1) {
      for (const stage of journey.majorStages!) {
        if (stage.position === initialPosition - 1) {
          startDate = increaseDateByOneDay(stage.scheduled_end_time);
          endDate = calculateEndDateByDuration(
            startDate,
            majorStageFormValues.duration_days.value,
          );
        }
      }
    } else {
      startDate = journey.scheduled_start_time;
      endDate = calculateEndDateByDuration(
        startDate,
        majorStageFormValues.duration_days.value,
      );
    }
  }
  return [startDate, endDate];
}

export function calculateDatesForMinorStage(
  majorStage: MajorStage,
  minorStageFormValues: MinorStageFormValues,
  initialPosition: number,
): [string, string] {
  let startDate = '';
  let endDate = '';

  if (minorStageFormValues) {
    if (initialPosition > 1) {
      for (const stage of majorStage.minorStages!) {
        if (stage.position === initialPosition - 1) {
          startDate = increaseDateByOneDay(stage.scheduled_end_time);
          endDate = calculateEndDateByDuration(
            startDate,
            minorStageFormValues.duration_days.value,
          );
        }
      }
    } else {
      startDate = majorStage.scheduled_start_time;
      endDate = calculateEndDateByDuration(
        startDate,
        minorStageFormValues.duration_days.value,
      );
    }
  }
  return [startDate, endDate];
}

function calculateEndDateByDuration(
  startDate: string,
  duration: number,
): string {
  const calculatedEndDate = startDate
    ? new Date(parseDate(startDate))
    : undefined;

  calculatedEndDate?.setDate(
    calculatedEndDate.getDate() + Math.max(duration - 1, 0),
  );

  return formatDate(calculatedEndDate!);
}

function increaseDateByOneDay(date: string): string {
  const newDate = new Date(parseDate(date));
  newDate?.setDate(newDate.getDate() + 1);
  return formatDate(newDate);
}
