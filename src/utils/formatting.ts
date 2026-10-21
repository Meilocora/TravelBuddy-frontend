import { CustomCountry } from '../models';

export function formatAmount(amount: number): string {
  if (amount < 1000) {
    return `${amount.toFixed(0)} €`;
  } else if (amount < 1000000) {
    return `${(amount / 1000).toFixed(1)}k €`;
  } else {
    return `${(amount / 1000000).toFixed(1)}mio €`;
  }
}

export function formatPercentage(percentage: number): string {
  if (percentage < 0.01) {
    return '<0.01%';
  }
  return percentage.toFixed(2) + '%';
}

export function formatQuantity(qty: number): string | null {
  if (!qty) {
    return null;
  } else if (qty < 1000) {
    return qty.toString();
  } else if (qty < 1000000) {
    return (qty / 1000).toFixed(1) + 'k';
  } else {
    return (qty / 1000000).toFixed(1) + 'mio';
  }
}

export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear().toString();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day); // Months are zero-based in JavaScript Date
}

export function parseEndDate(dateString: string): Date {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day + 1); // Months are zero-based in JavaScript Date
}

export function formatDateString(date: string | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  const dateObject = parseDate(date);
  const day = String(dateObject!.getDate()).padStart(2, '0');
  const month = String(dateObject!.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = dateObject!.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTimeString(date: string): string {
  const dateObject = parseDateAndTime(date);
  const day = String(dateObject.getDate()).padStart(2, '0');
  const year = dateObject.getFullYear();
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');
  const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  return `${day}.${month}.${year} (${hours}:${minutes})`;
}

export function parseDateAndTime(dateString: string): Date {
  const [datestring, time] = dateString.split(/\s/);
  const [day, month, year] = datestring.split('.').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function formatDurationToDays(
  startDate: string,
  endDate: string,
): number {
  const startDateObject = parseDate(startDate);
  const endDateObject = parseDate(endDate);
  endDateObject.setDate(endDateObject.getDate() + 1);

  return Math.max(
    Math.round(
      (endDateObject!.getTime() - startDateObject!.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
    1,
  );
}

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/**
 * Converts a local "dd.mm.yyyy hh:mm" time plus the UTC offset (in hours) of that place
 * into an absolute UTC timestamp. Independent of the device's timezone and DST,
 * supports fractional offsets (e.g. "5.5" for India).
 */
export function toUtcTimestamp(
  dateTime: string,
  utcOffset: string | number | undefined,
): number {
  const [datePart, timePart = '00:00'] = dateTime.trim().split(/\s+/);
  const [day, month, year] = datePart.split('.').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const offsetHours = Number(utcOffset) || 0;

  return (
    Date.UTC(year, month - 1, day, hours, minutes) - offsetHours * MS_PER_HOUR
  );
}

function formatTimeSpan(timeSpan: number, shortenFromDays?: number): string {
  const days = Math.floor(timeSpan / MS_PER_DAY);
  const hours = Math.floor((timeSpan % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((timeSpan % MS_PER_HOUR) / MS_PER_MINUTE)
    .toString()
    .padStart(2, '0'); // Always 2 digits

  if (shortenFromDays !== undefined && days >= shortenFromDays) {
    return `${days}d`;
  }

  if (days !== 0) {
    return `${days}d ${hours}:${minutes}h`;
  } else if (hours !== 0) {
    if (minutes === '00') {
      return `${hours}h`;
    }
    return `${hours}:${minutes}h`;
  } else {
    return `${minutes}m`;
  }
}

export function formatCountdown(
  startDate: string | undefined,
  startDateOffset: string,
  // Not needed anymore: Date.now() is already an absolute instant. Kept for call-site compatibility.
  _userOffset?: number,
  now: number = Date.now(),
): string | undefined {
  if (!startDate) {
    return undefined;
  }

  const timeDifference = toUtcTimestamp(startDate, startDateOffset) - now;

  if (timeDifference < 0) {
    return 'already departed';
  }

  return formatTimeSpan(timeDifference, 3);
}

export function formatDuration(
  startDate: string | undefined,
  startDateOffset: string | undefined,
  endDate: string | undefined,
  endDateOffset: string | undefined,
): string | undefined {
  if (!startDate || !endDate) {
    return undefined;
  }

  const timeDifference =
    toUtcTimestamp(endDate, endDateOffset) -
    toUtcTimestamp(startDate, startDateOffset);

  if (isNaN(timeDifference) || timeDifference < 0) {
    return '–';
  }

  return formatTimeSpan(timeDifference);
}

/**
 * Remaining days of a stage, counting today and the end date inclusively
 * (on the last day this returns 1).
 */
export function formatRemainingDays(endDate: string | undefined) {
  if (!endDate) {
    return undefined;
  }
  const today = formatDate(new Date());
  return formatDurationToDays(today, endDate);
}

function diffInDays(from: Date, to: Date): number {
  // Math.round compensates for DST shifts (23h / 25h days)
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Calendar days between two "dd.mm.yyyy" dates (positive if `to` is later).
 */
export function diffInCalendarDays(from: string, to: string): number {
  return diffInDays(parseDate(from), parseDate(to));
}

/**
 * Calendar days from today until the given "dd.mm.yyyy" date
 * (0 = today, 1 = tomorrow, negative = in the past).
 */
export function daysUntil(date: string, now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return diffInDays(today, parseDate(date));
}

export type DateProgressStatus = 'upcoming' | 'active' | 'completed';

export interface DateProgress {
  status: DateProgressStatus;
  progress: number; // always within [0, 1]
  currentDay: number;
  totalDays: number;
  daysUntilStart: number;
}

const DATE_PATTERN = /^\d{1,2}\.\d{1,2}\.\d{4}$/;

/**
 * Calculates the day-based progress between two "dd.mm.yyyy" dates.
 * Returns null for missing, malformed or inverted dates instead of throwing / producing NaN.
 */
export function getDateProgress(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now: Date = new Date(),
): DateProgress | null {
  if (
    !startDate ||
    !endDate ||
    !DATE_PATTERN.test(startDate.trim()) ||
    !DATE_PATTERN.test(endDate.trim())
  ) {
    return null;
  }

  const start = parseDate(startDate.trim());
  const end = parseDate(endDate.trim());
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return null;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const totalDays = diffInDays(start, end) + 1;

  if (today < start) {
    return {
      status: 'upcoming',
      progress: 0,
      currentDay: 0,
      totalDays,
      daysUntilStart: diffInDays(today, start),
    };
  }

  if (today > end) {
    return {
      status: 'completed',
      progress: 1,
      currentDay: totalDays,
      totalDays,
      daysUntilStart: 0,
    };
  }

  const currentDay = diffInDays(start, today) + 1;
  return {
    status: 'active',
    progress: Math.min(Math.max(currentDay / totalDays, 0), 1),
    currentDay,
    totalDays,
    daysUntilStart: 0,
  };
}

export function formatStringToList(string: string): string[] {
  return string.split(',').map((item) => item.trim());
}

export function formatCountrynamesToString(
  customCountries: CustomCountry[] | CustomCountry,
) {
  let nameList: string[] = [];

  if (Array.isArray(customCountries)) {
    for (const key in customCountries) {
      const country = customCountries[key];
      nameList.push(country.name);
    }
    return nameList.join(', ');
  } else {
    return customCountries.name;
  }
}

export function formatRouteDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60)
    .toString()
    .padStart(2, '0');

  if (duration < 1) {
    return '0m';
  } else if (duration < 60) {
    return `${minutes}m`;
  }
  return `${hours}:${minutes}h`;
}

export function addDaysToDateString(dateString: string, days = 1): string {
  const dateObject = parseDate(dateString);
  dateObject.setDate(dateObject.getDate() + days);
  return formatDate(dateObject);
}
