// Chapter 3: Dates — vanilla replacements for moment.js / date-fns

export function formatDate(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(date);
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function relativeTime(date, now = new Date()) {
  const diffDays = Math.round((date - now) / 86400000);
  return rtf.format(diffDays, 'day');
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const isBefore = (a, b) => a.getTime() < b.getTime();
export const isSameDay = (a, b) => a.toDateString() === b.toDateString();

export function formatInTimeZone(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone, hour: '2-digit', minute: '2-digit'
  }).format(date);
}
