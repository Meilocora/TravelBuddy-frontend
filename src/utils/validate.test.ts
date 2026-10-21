import { describe, expect, it } from '@jest/globals';

import { Journey } from '../models';
import { validateIsOverDateTime, validateJourney } from './validate';

function buildJourney(
  stages: { start: string; end: string }[],
  start: string,
  end: string,
): Journey {
  return {
    name: 'Test',
    scheduled_start_time: start,
    scheduled_end_time: end,
    countries: [],
    costs: { budget: 0, spent_money: 0 },
    majorStages: stages.map((stage, index) => ({
      id: index,
      title: `Stage ${index + 1}`,
      position: index + 1,
      scheduled_start_time: stage.start,
      scheduled_end_time: stage.end,
      country: { name: 'Germany' },
      costs: { budget: 0, spent_money: 0 },
      transportation: {},
      minorStages: [],
    })),
  } as unknown as Journey;
}

function dateChecks(journey: Journey) {
  return validateJourney(journey)
    .map((check) => check.subtitle)
    .filter(
      (subtitle) => subtitle.includes('Gap') || subtitle.includes('covered'),
    );
}

describe('validate utilities', () => {
  it('accepts stages that continue across a month boundary', () => {
    const journey = buildJourney(
      [
        { start: '25.10.2026', end: '31.10.2026' },
        { start: '01.11.2026', end: '05.11.2026' },
      ],
      '25.10.2026',
      '05.11.2026',
    );
    expect(dateChecks(journey)).toEqual([]);
  });

  it('detects gaps and uncovered dates in different months', () => {
    const journey = buildJourney(
      [
        { start: '25.09.2026', end: '30.09.2026' },
        { start: '05.10.2026', end: '05.11.2026' },
      ],
      '25.10.2026',
      '05.12.2026',
    );
    expect(dateChecks(journey)).toEqual([
      "Journey's start date not covered",
      "Journey's end date not covered",
      'Gap between Major Stages',
    ]);
  });

  it('compares transportation times as absolute instants', () => {
    // 21.10.2026 10:00 in Berlin
    const now = Date.UTC(2026, 9, 21, 8, 0);
    // Tokyo 16:00 (UTC+9) = 07:00 UTC -> already over
    expect(validateIsOverDateTime('21.10.2026 16:00', '9', 2, now)).toBe(true);
    // New York 05:00 (UTC-4) = 09:00 UTC -> not yet
    expect(validateIsOverDateTime('21.10.2026 05:00', '-4', 2, now)).toBe(
      false,
    );
  });
});
