import { describe, expect, it } from '@jest/globals';

import {
  formatDate,
  formatDurationToDays,
  formatStringToList,
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
});
