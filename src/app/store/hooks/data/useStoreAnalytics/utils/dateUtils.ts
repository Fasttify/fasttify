/**
 * Utilidades para manejo de fechas en analíticas
 */

import {
  formatDateToISO,
  getDateDaysAgo,
  getDateRangeForPeriod,
  isValidDateFormat,
  getDatesBetween,
  groupDatesByPeriod,
  formatDateForChart,
} from '@/lib/utils/date-utils';

/**
 * Formatea una fecha a string YYYY-MM-DD
 */
export const formatDateForAnalytics = (date: Date): string => {
  return formatDateToISO(date);
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return formatDateForAnalytics(new Date());
};

/**
 * Obtiene la fecha de hace N días
 */
export const getDateDaysAgoAnalytics = (days: number): string => {
  return getDateDaysAgo(days);
};

/**
 * Obtiene el rango de fechas para un período específico
 */
export const getDateRangeForPeriodAnalytics = (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): { start: string; end: string } => {
  return getDateRangeForPeriod(period);
};

/**
 * Valida si una fecha está en formato YYYY-MM-DD
 */
export const isValidDateFormatAnalytics = (dateString: string): boolean => {
  return isValidDateFormat(dateString);
};

/**
 * Obtiene un array de fechas entre dos fechas
 */
export const getDatesBetweenAnalytics = (startDate: string, endDate: string): string[] => {
  return getDatesBetween(startDate, endDate);
};

/**
 * Agrupa fechas por período
 */
export const groupDatesByPeriodAnalytics = (
  dates: string[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Record<string, string[]> => {
  return groupDatesByPeriod(dates, period);
};

/**
 * Formatea una fecha para mostrar en gráficos (incluye año para evitar ambigüedad)
 */
export const formatDateForChartAnalytics = (dateString: string): string => {
  return formatDateForChart(dateString);
};
