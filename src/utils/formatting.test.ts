import { describe, expect, it } from '@jest/globals';

import {
  daysUntil,
  diffInCalendarDays,
  formatCountdown,
  formatDate,
  formatDuration,
  formatDurationToDays,
  formatStringToList,
  getDateProgress,
  parseDate,
  toUtcTimestamp,
} from './formatting';

describe('formatting utilities', () => {
  it('formats and parses dates consistently', () => {
    const date = new Date(2026, 8, 20);

    expect(formatDate(date)).toBe('20.09.2026');
    expect(parseDate('20.09.2026')).toEqual(date);
  });

  it('counts journey days inclusively', () => {
    expect(formatDurationToDays('20.09.2026', '20.09.2026')).toBe(1);
    expect(formatDurationToDays('20.09.2026', '22.09.2026')).toBe(3);
  });

  it('splits comma-separated lists', () => {
    expect(formatStringToList('Germany, France, Japan')).toEqual([
      'Germany',
      'France',
      'Japan',
    ]);
  });

  describe('getDateProgress', () => {
    const now = new Date(2026, 9, 20, 15, 30); // 20.10.2026

    it('returns null for missing or malformed dates instead of throwing', () => {
      expect(getDateProgress(null, '25.10.2026', now)).toBeNull();
      expect(getDateProgress('20.10.2026', undefined, now)).toBeNull();
      expect(getDateProgress('2026-10-20', '25.10.2026', now)).toBeNull();
      expect(getDateProgress('25.10.2026', '20.10.2026', now)).toBeNull();
    });

    it('reports upcoming journeys with days until start', () => {
      expect(getDateProgress('21.10.2026', '25.10.2026', now)).toEqual({
        status: 'upcoming',
        progress: 0,
        currentDay: 0,
        totalDays: 5,
        daysUntilStart: 1,
      });
    });

    it('counts the current day inclusively, including the last day', () => {
      expect(getDateProgress('20.10.2026', '29.10.2026', now)).toMatchObject({
        status: 'active',
        currentDay: 1,
        totalDays: 10,
        progress: 0.1,
      });
      expect(getDateProgress('16.10.2026', '20.10.2026', now)).toMatchObject({
        status: 'active',
        currentDay: 5,
        progress: 1,
      });
    });

    it('reports completed journeys', () => {
      expect(getDateProgress('01.10.2026', '19.10.2026', now)).toMatchObject({
        status: 'completed',
        progress: 1,
      });
    });
  });

  describe('time zone aware calculations', () => {
    // 21.10.2026 10:00 in Berlin (UTC+2)
    const now = Date.UTC(2026, 9, 21, 8, 0);

    it('converts local times with their UTC offset into absolute timestamps', () => {
      expect(toUtcTimestamp('22.10.2026 10:00', '9')).toBe(
        Date.UTC(2026, 9, 22, 1, 0),
      );
      expect(toUtcTimestamp('22.10.2026 10:00', '-5')).toBe(
        Date.UTC(2026, 9, 22, 15, 0),
      );
      expect(toUtcTimestamp('22.10.2026 10:00', '5.5')).toBe(
        Date.UTC(2026, 9, 22, 4, 30),
      );
    });

    it('counts down to a departure in another time zone', () => {
      // Tokyo 10:00 (UTC+9) = 01:00 UTC -> 17h from 08:00 UTC
      expect(formatCountdown('22.10.2026 10:00', '9', 2, now)).toBe('17h');
      expect(formatCountdown('21.10.2026 10:30', '2', 2, now)).toBe('30m');
      expect(formatCountdown('21.10.2026 09:00', '2', 2, now)).toBe(
        'already departed',
      );
      expect(formatCountdown('30.10.2026 10:00', '2', 2, now)).toBe('9d');
    });

    it('calculates travel durations across time zones', () => {
      // Frankfurt 10:00 (UTC+2) -> New York 13:00 (UTC-4) = 9h
      expect(
        formatDuration('21.10.2026 10:00', '2', '21.10.2026 13:00', '-4'),
      ).toBe('9h');
      // Berlin 22:00 (UTC+2) -> Delhi 10:30 next day (UTC+5.5) = 9h
      expect(
        formatDuration('21.10.2026 22:00', '2', '22.10.2026 10:30', '5.5'),
      ).toBe('9h');
      expect(
        formatDuration('21.10.2026 10:00', '2', '21.10.2026 09:00', '2'),
      ).toBe('–');
    });

    it('counts calendar days without including the start day', () => {
      const today = new Date(2026, 9, 21, 15, 0);
      expect(daysUntil('21.10.2026', today)).toBe(0);
      expect(daysUntil('22.10.2026', today)).toBe(1);
      expect(daysUntil('20.10.2026', today)).toBe(-1);
      expect(diffInCalendarDays('31.10.2026', '01.11.2026')).toBe(1);
      expect(diffInCalendarDays('28.03.2026', '30.03.2026')).toBe(2); // DST change
    });
  });
});
