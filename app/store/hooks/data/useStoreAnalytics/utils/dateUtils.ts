/**
 * Utilidades para manejo de fechas en analíticas
 */

/**
 * Formatea una fecha a string YYYY-MM-DD
 */
export const formatDateForAnalytics = (date: Date): string => {
  return date.toISOString().split('T')[0];
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
export const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateForAnalytics(date);
};

/**
 * Obtiene el rango de fechas para un período específico
 */
export const getDateRangeForPeriod = (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'daily':
      // Últimos 30 días
      start.setDate(end.getDate() - 30);
      break;
    case 'weekly':
      // Últimas 12 semanas
      start.setDate(end.getDate() - 12 * 7);
      break;
    case 'monthly':
      // Últimos 12 meses
      start.setMonth(end.getMonth() - 12);
      break;
    case 'yearly':
      // Últimos 5 años
      start.setFullYear(end.getFullYear() - 5);
      break;
  }

  return {
    start: formatDateForAnalytics(start),
    end: formatDateForAnalytics(end),
  };
};

/**
 * Valida si una fecha está en formato YYYY-MM-DD
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Obtiene un array de fechas entre dos fechas
 */
export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(formatDateForAnalytics(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Agrupa fechas por período
 */
export const groupDatesByPeriod = (
  dates: string[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Record<string, string[]> => {
  const groups: Record<string, string[]> = {};

  dates.forEach((date) => {
    const d = new Date(date);
    let key: string;

    switch (period) {
      case 'daily':
        key = date; // Ya está en formato YYYY-MM-DD
        break;
      case 'weekly':
        // Obtener el lunes de esa semana
        const monday = new Date(d);
        monday.setDate(d.getDate() - d.getDay() + 1);
        key = formatDateForAnalytics(monday);
        break;
      case 'monthly':
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'yearly':
        key = String(d.getFullYear());
        break;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(date);
  });

  return groups;
};
