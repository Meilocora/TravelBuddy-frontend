import { Float } from 'react-native/Libraries/Types/CodegenTypes';
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

export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day); // Months are zero-based in JavaScript Date
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
  endDate: string
): number {
  const startDateObject = parseDate(startDate);
  const endDateObject = parseDate(endDate);

  return Math.round(
    (endDateObject!.getTime() - startDateObject!.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export function formatCountdown(
  startDate: string | undefined,
  startDateOffset: string,
  userOffset: number
): string | undefined {
  if (!startDate) {
    return undefined;
  }
  const currentDateObject = new Date();
  currentDateObject.setHours(currentDateObject.getHours() + userOffset);

  const startDateObject = parseDateAndTime(startDate);
  startDateObject.setHours(
    startDateObject.getHours() + Number(startDateOffset)
  );

  const timeDifference =
    startDateObject.getTime() - currentDateObject.getTime();

  if (timeDifference < 0) {
    return 'already departed';
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0'); // Always 2 digits

  if (days >= 3) {
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

export function formatDuration(
  startDate: string | undefined,
  startDateOffset: string | undefined,
  endDate: string | undefined,
  endDateOffset: string | undefined
): string | undefined {
  if (!startDate || !endDate) {
    return undefined;
  }

  const startDateObject = parseDateAndTime(startDate);
  startDateObject.setHours(
    startDateObject.getHours() + Number(startDateOffset)
  );

  const endDateObject = parseDateAndTime(endDate);
  endDateObject.setHours(endDateObject.getHours() + Number(endDateOffset));
  const timeDifference = endDateObject.getTime() - startDateObject.getTime();

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0'); // Always 2 digits

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

export function formatCountdownDays(startDate: string | undefined) {
  if (!startDate) {
    return undefined;
  }
  const today = formatDate(new Date());
  const daysLeft = formatDurationToDays(today, startDate);
  return daysLeft;
}

export function formatProgress(startDate: string, endDate: string): Float {
  const today = new Date();
  const startDateObject = parseDate(startDate);
  const endDateObject = parseDate(endDate);

  if (today < startDateObject!) {
    return 0;
  } else if (today > endDateObject!) {
    return 1;
  } else {
    const totalDuration = formatDurationToDays(startDate, endDate);
    const daysPassed = formatDurationToDays(startDate, formatDate(today));

    const progress = daysPassed / totalDuration;
    return parseFloat((daysPassed / totalDuration).toFixed(2));
  }
}

export function formatStringToList(string: string): string[] {
  return string.split(',').map((item) => item.trim());
}

export function formatCountrynamesToString(
  customCountries: CustomCountry[] | CustomCountry
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
  if (duration < 60) {
    return `${minutes}m`;
  }
  return `${hours}:${minutes}h`;
}
