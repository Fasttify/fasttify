/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Utilidades para manejo de fechas
 */

/**
 * Formatea una fecha a string YYYY-MM-DD
 * @param date - Fecha a formatear
 * @returns Fecha en formato YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formatea una fecha a string YYYY-MM-DD (alias para compatibilidad)
 * @param date - Fecha a formatear
 * @returns Fecha en formato YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return formatDateToISO(date);
}

/**
 * Formatea una fecha para mostrar en español
 * @param date - Fecha a formatear
 * @returns Fecha formateada en español
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha para mostrar en gráficos
 * @param dateString - Fecha en formato string
 * @returns Fecha formateada para gráficos
 */
export function formatDateForChart(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

/**
 * Formatea una fecha para mostrar en tablas
 * @param date - Fecha a formatear
 * @returns Fecha formateada para tablas
 */
export function formatDateForTable(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formatea una fecha y hora para mostrar
 * @param date - Fecha a formatear
 * @returns Fecha y hora formateada
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * @returns Fecha de hoy
 */
export function getTodayDate(): string {
  return formatDateToISO(new Date());
}

/**
 * Obtiene la fecha de hace N días
 * @param days - Número de días hacia atrás
 * @returns Fecha hace N días
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateToISO(date);
}

/**
 * Obtiene la fecha de hace N días desde una fecha específica
 * @param fromDate - Fecha de referencia
 * @param days - Número de días hacia atrás
 * @returns Fecha hace N días desde la fecha de referencia
 */
export function getDateDaysAgoFrom(fromDate: Date, days: number): string {
  const date = new Date(fromDate);
  date.setDate(date.getDate() - days);
  return formatDateToISO(date);
}

/**
 * Obtiene el rango de fechas para un período específico
 * @param period - Período de tiempo
 * @returns Rango de fechas
 */
export function getDateRangeForPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): {
  start: string;
  end: string;
} {
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
    start: formatDateToISO(start),
    end: formatDateToISO(end),
  };
}

/**
 * Valida si una fecha está en formato YYYY-MM-DD
 * @param dateString - String de fecha a validar
 * @returns true si la fecha es válida
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida si una fecha es válida
 * @param dateString - String de fecha a validar
 * @returns true si la fecha es válida
 */
export function isValidDate(dateString: string): boolean {
  return dateString.length === 10 && isValidDateFormat(dateString);
}

/**
 * Parsea una fecha en formato YYYY-MM-DD a objeto Date
 * @param dateString - String de fecha
 * @returns Objeto Date
 */
export function parseDate(dateString: string): Date {
  // Date-only strings (e.g. "1970-01-01") are treated as UTC, not local time
  // when using new Date()
  // We need to split year, month, day to pass into new Date() separately
  // to get a localized Date
  const [year, month, day] = dateString.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * Obtiene un array de fechas entre dos fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Array de fechas
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(formatDateToISO(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Agrupa fechas por período
 * @param dates - Array de fechas
 * @param period - Período de agrupación
 * @returns Fechas agrupadas por período
 */
export function groupDatesByPeriod(
  dates: string[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Record<string, string[]> {
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
        key = formatDateToISO(monday);
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
}

/**
 * Obtiene el primer día del mes
 * @param date - Fecha de referencia
 * @returns Primer día del mes
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtiene el último día del mes
 * @param date - Fecha de referencia
 * @returns Último día del mes
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Obtiene el primer día de la semana (lunes)
 * @param date - Fecha de referencia
 * @returns Primer día de la semana
 */
export function getFirstDayOfWeek(date: Date): Date {
  const firstDay = new Date(date);
  const day = firstDay.getDay();
  const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
  firstDay.setDate(diff);
  return firstDay;
}

/**
 * Obtiene el último día de la semana (domingo)
 * @param date - Fecha de referencia
 * @returns Último día de la semana
 */
export function getLastDayOfWeek(date: Date): Date {
  const lastDay = new Date(date);
  const day = lastDay.getDay();
  const diff = lastDay.getDate() - day + (day === 0 ? 0 : 7); // Ajustar para que domingo sea el último día
  lastDay.setDate(diff);
  return lastDay;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Diferencia en días
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula la diferencia en días entre dos fechas (strings)
 * @param date1 - Primera fecha en formato string
 * @param date2 - Segunda fecha en formato string
 * @returns Diferencia en días
 */
export function getDaysDifferenceFromStrings(date1: string, date2: string): number {
  return getDaysDifference(new Date(date1), new Date(date2));
}

/**
 * Verifica si una fecha está dentro de un rango
 * @param date - Fecha a verificar
 * @param startDate - Fecha de inicio del rango
 * @param endDate - Fecha de fin del rango
 * @returns true si la fecha está dentro del rango
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Verifica si una fecha está dentro de un rango (strings)
 * @param date - Fecha a verificar en formato string
 * @param startDate - Fecha de inicio del rango en formato string
 * @param endDate - Fecha de fin del rango en formato string
 * @returns true si la fecha está dentro del rango
 */
export function isDateInRangeFromStrings(date: string, startDate: string, endDate: string): boolean {
  return isDateInRange(new Date(date), new Date(startDate), new Date(endDate));
}

/**
 * Obtiene la fecha actual en formato ISO string
 * @returns Fecha actual en formato ISO
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Obtiene la fecha actual en formato ISO string (solo fecha)
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export function getCurrentDateString(): string {
  return formatDateToISO(new Date());
}

/**
 * Obtiene la fecha y hora actual en formato ISO string
 * @returns Fecha y hora actual en formato ISO
 */
export function getCurrentDateTimeString(): string {
  return new Date().toISOString();
}

/**
 * Formatea una fecha para mostrar tiempo relativo (hace X tiempo)
 * @param date - Fecha a formatear
 * @returns Tiempo relativo en español
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace un momento';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
}
