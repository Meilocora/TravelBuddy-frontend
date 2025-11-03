import { parse } from 'dotenv';
import { Journey, MajorStage, MinorStage, StagesPositionDict } from '../models';
import { parseDate, parseDateAndTime } from './formatting';

export function validateIsOver(date: string): boolean {
  const d = parseDate(date);

  const day = new Date(d);
  day.setHours(0, 0, 0, 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return day.getTime() < startOfToday.getTime();
}

export function validateIsOverDateTime(
  comparisonDate: string,
  comparisonDateOffset: string,
  userOffset: number
): boolean {
  const comparisonDateObject = parseDateAndTime(comparisonDate);
  comparisonDateObject.setHours(
    comparisonDateObject.getHours() + Number(comparisonDateOffset)
  );

  const currentDateObject = new Date();
  currentDateObject.setHours(currentDateObject.getHours() + userOffset);

  const timeDifference =
    comparisonDateObject.getTime() - currentDateObject.getTime();
  if (timeDifference > 0) {
    return false;
  } else {
    return true;
  }
}

export interface CheckLog {
  subtitle: string;
  description: string;
}

export function validateJourney(journey: Journey): CheckLog[] {
  const checks: CheckLog[] = [];

  // Check if all countries in the journey are represented in major stages
  const journeyCountries = journey.countries.map((country) => country.name);
  const majorStagesCountries = new Set(
    journey.majorStages?.map((majorStage) => majorStage.country.name) || []
  );
  const missingCountries = journeyCountries.filter(
    (country) => !majorStagesCountries.has(country)
  );

  if (missingCountries.length > 0) {
    checks.push({
      subtitle: 'Missing countries in major stages',
      description: `The following countries are not represented in any major stage: ${missingCountries.join(
        ', '
      )}.`,
    });
  }

  // Check if budget of journey is exceeded
  if (journey.costs.budget <= journey.costs.spent_money) {
    checks.push({
      subtitle: 'Journey Budget exceeded',
      description: `Your budget of ${
        journey.costs.budget
      } has been exceeded by ${
        journey.costs.spent_money - journey.costs.budget
      }.`,
    });
  }

  // Check if journey even has majorStages
  if (!journey.majorStages || journey.majorStages.length === 0) {
    checks.push({
      subtitle: 'No major stages',
      description: 'You have not added any major stages to your journey.',
    });
  } else {
    // Check if the journey is covered by major stages
    const coverageChecks = validateCoversSuperiorStage(
      journey,
      journey.majorStages
    );
    if (coverageChecks.length > 0) {
      checks.push(...coverageChecks);
    }

    // Check if majorStages are planned correctly without gaps
    const planningGaps = validateStagesDates(journey.majorStages);
    if (planningGaps.length > 0) {
      checks.push(...planningGaps);
    }

    for (const majorStage of journey.majorStages) {
      // Check if the budget of the majorStage is exceeded
      if (majorStage.costs.budget <= majorStage.costs.spent_money) {
        checks.push({
          subtitle: 'Major stage budget exceeded',
          description: `Major stage "${
            majorStage.title
          }" has exceeded its budget of ${majorStage.costs.budget} by ${
            majorStage.costs.spent_money - majorStage.costs.budget
          }.`,
        });
      }
      // Check if the majorStage has a transportation
      if (!majorStage.transportation) {
        checks.push({
          subtitle: 'Missing transportation',
          description: `Major stage "${majorStage.title}" has no transportation.`,
        });
      }
      // Check if the majorStage has minorStages
      if (!majorStage.minorStages || majorStage.minorStages.length === 0) {
        checks.push({
          subtitle: 'No minor stages',
          description: `Major stage "${majorStage.title}" has no minor stages.`,
        });
      } else {
        // Check if the major stage is covered by minor stages
        const coverageChecks = validateCoversSuperiorStage(
          majorStage,
          majorStage.minorStages
        );
        if (coverageChecks.length > 0) {
          checks.push(...coverageChecks);
        }

        // Check if minorStages are planned correctly without gaps
        const planningGaps = validateStagesDates(majorStage.minorStages);
        if (planningGaps.length > 0) {
          checks.push(...planningGaps);
        }

        for (const minorStage of majorStage.minorStages) {
          // Check if the budget of the minorStage is exceeded
          if (minorStage.costs.budget <= minorStage.costs.spent_money) {
            checks.push({
              subtitle: 'Minor stage budget exceeded',
              description: `Minor stage "${
                minorStage.title
              }" has exceeded its budget of ${minorStage.costs.budget} by ${
                minorStage.costs.spent_money - minorStage.costs.budget
              }.`,
            });
          }
          // Check if the minorStage has a transportation
          if (!minorStage.transportation) {
            checks.push({
              subtitle: 'Missing transportation',
              description: `Minor stage "${minorStage.title}" has no transportation.`,
            });
          }
          // Check if the minorStage has an accommodation
          if (
            !minorStage.accommodation.place &&
            !minorStage.accommodation.link &&
            !minorStage.accommodation.costs
          ) {
            checks.push({
              subtitle: 'Missing accommodation',
              description: `Minor stage "${minorStage.title}" has no accommodation.`,
            });
          }
        }
      }
    }
  }
  return checks;
}

function validateCoversSuperiorStage(
  superiorStage: Journey | MajorStage,
  inferiorStages: MajorStage[] | MinorStage[]
): CheckLog[] {
  let checks: CheckLog[] = [];

  const superiorStageType =
    'country' in superiorStage ? 'Major Stage' : 'Journey';
  const inferiorStageType =
    superiorStageType === 'Major Stage' ? 'Minor Stage' : 'Major Stage';

  let superiorTitle: string;
  if (superiorStageType === 'Major Stage') {
    superiorTitle = (superiorStage as MajorStage).title;
  } else {
    superiorTitle = (superiorStage as Journey).name!;
  }

  const superiorStart = parseDate(superiorStage.scheduled_start_time).getDate();
  const superiorEnd = parseDate(superiorStage.scheduled_end_time).getDate();

  const coversStart =
    parseDate(inferiorStages[0].scheduled_start_time).getDate() ===
    superiorStart;
  if (!coversStart) {
    checks.push({
      subtitle: `${superiorStageType}'s start date not covered`,
      description: `${superiorStageType} "${superiorTitle}" starts on ${superiorStage.scheduled_start_time} but ${inferiorStageType} "${inferiorStages[0].title}" starts on ${inferiorStages[0].scheduled_start_time}.`,
    });
  }
  const coversEnd =
    parseDate(
      inferiorStages[inferiorStages.length - 1].scheduled_end_time
    ).getDate() === superiorEnd;
  if (!coversEnd) {
    checks.push({
      subtitle: `${superiorStageType}'s end date not covered`,
      description: `${superiorStageType} "${superiorTitle}" ends on ${
        superiorStage.scheduled_end_time
      } but ${inferiorStageType} "${
        inferiorStages[inferiorStages.length - 1].title
      }" ends on ${
        inferiorStages[inferiorStages.length - 1].scheduled_end_time
      }.`,
    });
  }
  return checks;
}

function validateStagesDates(stages: MajorStage[] | MinorStage[]) {
  const checks: CheckLog[] = [];

  const stageType = 'country' in stages[0] ? 'Major Stage' : 'Minor Stage';

  for (let i = 0; i < stages.length - 1; i++) {
    const currentEnd = parseDate(stages[i].scheduled_end_time).getDate();
    const nextStart = parseDate(stages[i + 1].scheduled_start_time).getDate();
    if (currentEnd !== nextStart - 1) {
      checks.push({
        subtitle: `Gap between ${stageType}s`,
        description: `There is a gap between "${
          stages[i].title
        }" (${currentEnd}) and "${stages[i + 1].title}" (${nextStart}).`,
      });
    }
  }

  return checks;
}

export function validateOrders(
  a: StagesPositionDict[],
  b: StagesPositionDict[]
) {
  if (a.length !== b.length) return false;
  return a.every((x, i) => x.id === b[i].id && x.position === b[i].position);
}
