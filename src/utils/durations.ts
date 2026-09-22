import { Journey, MajorStage, MinorStageFormValues } from '../models';
import { formatDate, parseDate } from './formatting';

export function calculateDatesForMajorStage(
  journey: Journey,
  durationDays: number,
  initialPosition: number,
  editMajorStageId: number | undefined,
): [string, string, boolean] {
  let startDate = '';
  let endDate = '';
  let durationExceeded = false;
  let majorStageDurations: number = 0;

  if (initialPosition > 1) {
    for (const stage of journey.majorStages!) {
      if (stage.position === initialPosition - 1) {
        startDate = increaseDateByOneDay(stage.scheduled_end_time);
        endDate = calculateEndDateByDuration(startDate, durationDays);
      }
    }
  } else {
    startDate = journey.scheduled_start_time;
    endDate = calculateEndDateByDuration(startDate, durationDays);
  }
  if (journey.majorStages && journey.majorStages.length > 0) {
    for (const stage of journey.majorStages!) {
      if (stage.id !== editMajorStageId) {
        majorStageDurations += stage.duration_days;
      }
    }
    durationExceeded =
      majorStageDurations + durationDays > journey.duration_days;
  } else {
    durationExceeded =
      parseDate(endDate) > parseDate(journey.scheduled_end_time);
  }

  return [startDate, endDate, durationExceeded];
}

export function calculateMaxDurationDaysForMajorStage(
  journey: Journey | undefined,
): number {
  if (journey == undefined) {
    return 0;
  }
  let majorStageDurations = 0;
  if (journey.majorStages && journey.majorStages.length > 0) {
    for (const stage of journey.majorStages) {
      majorStageDurations += stage.duration_days;
    }
  }
  return journey.duration_days - majorStageDurations;
}

export function calculateDatesForMinorStage(
  majorStage: MajorStage,
  durationDays: number,
  initialPosition: number,
  editMinorStageId: number | undefined,
): [string, string, boolean] {
  let startDate = '';
  let endDate = '';
  let durationExceeded = false;
  let minorStageDurations = 0;

  if (initialPosition > 1) {
    for (const stage of majorStage.minorStages!) {
      if (stage.position === initialPosition - 1) {
        startDate = increaseDateByOneDay(stage.scheduled_end_time);
        endDate = calculateEndDateByDuration(startDate, durationDays);
      }
    }
  } else {
    startDate = majorStage.scheduled_start_time;
    endDate = calculateEndDateByDuration(startDate, durationDays);
  }
  if (majorStage.minorStages && majorStage.minorStages.length > 0) {
    for (const stage of majorStage.minorStages!) {
      if (stage.id !== editMinorStageId) {
        minorStageDurations += stage.duration_days;
      }
    }
    durationExceeded =
      minorStageDurations + durationDays > majorStage.duration_days;
  } else {
    durationExceeded =
      parseDate(endDate) > parseDate(majorStage.scheduled_end_time);
  }

  return [startDate, endDate, durationExceeded];
}

export function calculateMaxDurationDaysForMinorStage(
  majorStage: MajorStage | undefined,
): number {
  if (majorStage == undefined) {
    return 0;
  }
  let minorStageDurations = 0;
  if (majorStage.minorStages && majorStage.minorStages.length > 0) {
    for (const stage of majorStage.minorStages) {
      minorStageDurations += stage.duration_days;
    }
  }
  return majorStage.duration_days - minorStageDurations;
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
