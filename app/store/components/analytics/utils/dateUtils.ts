export const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;

export function isDate(date: string): boolean {
  return !isNaN(new Date(date).getDate());
}

export function isValidYearMonthDayDateString(date: string): boolean {
  return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
}

export function isValidDate(date: string): boolean {
  return date.length === 10 && isValidYearMonthDayDateString(date);
}

export function parseYearMonthDayDateString(input: string): Date {
  // Date-only strings (e.g. "1970-01-01") are treated as UTC, not local time
  // when using new Date()
  // We need to split year, month, day to pass into new Date() separately
  // to get a localized Date
  const [year, month, day] = input.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatDateToYearMonthDayDateString(date: Date): string {
  const year = String(date.getFullYear());
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());

  if (month.length < 2) {
    month = String(month).padStart(2, '0');
  }
  if (day.length < 2) {
    day = String(day).padStart(2, '0');
  }

  return [year, month, day].join('-');
}

export function formatDate(date: Date): string {
  return formatDateToYearMonthDayDateString(date);
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function nodeContainsDescendant(rootNode: Node | null, descendant: Node | null): boolean {
  if (rootNode === descendant) {
    return true;
  }
  let parent = descendant?.parentNode;
  while (parent != null) {
    if (parent === rootNode) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}
