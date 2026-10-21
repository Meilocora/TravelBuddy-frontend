import { describe, expect, it } from '@jest/globals';

import {
  formatDate,
  formatDurationToDays,
  formatStringToList,
  getDateProgress,
  parseDate,
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
});
