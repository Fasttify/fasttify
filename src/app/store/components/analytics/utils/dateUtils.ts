import {
  isValidDate as isValidDateUtil,
  parseDate,
  formatDateToISO,
  formatDateForDisplay as formatDateForDisplayUtil,
} from '@/lib/utils/date-utils';

export const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;

export function isDate(date: string): boolean {
  return !isNaN(new Date(date).getDate());
}

export function isValidYearMonthDayDateString(date: string): boolean {
  return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
}

export function isValidDate(date: string): boolean {
  return isValidDateUtil(date);
}

export function parseYearMonthDayDateString(input: string): Date {
  return parseDate(input);
}

export function formatDateToYearMonthDayDateString(date: Date): string {
  return formatDateToISO(date);
}

export function formatDate(date: Date): string {
  return formatDateToISO(date);
}

export function formatDateForDisplay(date: Date): string {
  return formatDateForDisplayUtil(date);
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
