import React from 'react';
import { StoreAnalytics } from '../types/useStoreAnalytics-types';
import { parseJsonMetric } from './analyticsCalculations';
import { useAnalyticsCurrencyFormatting } from './useAnalyticsCurrencyFormatting';

/**
 * Hook genérico para procesar datos JSON de sesiones
 * @param analytics - Array de datos de analíticas
 * @param fieldName - Nombre del campo a procesar (sessionsByDevice, sessionsByCountry, etc.)
 * @param errorLabel - Etiqueta para el error en caso de fallo en el parsing
 */
export const useJsonSessionData = (
  analytics: StoreAnalytics[] | null,
  fieldName: keyof StoreAnalytics,
  errorLabel: string
) => {
  return React.useMemo(() => {
    if (!analytics || analytics.length === 0) return {};

    const totals: Record<string, number> = {};

    analytics.forEach((item) => {
      const fieldValue = item[fieldName];
      if (fieldValue) {
        try {
          let sessions: Record<string, number>;

          if (typeof fieldValue === 'string') {
            sessions = parseJsonMetric(fieldValue);
          } else {
            sessions = fieldValue as Record<string, number>;
          }

          Object.entries(sessions).forEach(([key, value]) => {
            totals[key] = (totals[key] || 0) + value;
          });
        } catch (error) {
          console.warn(`Error parsing ${errorLabel}:`, error);
        }
      }
    });

    return totals;
  }, [analytics, fieldName, errorLabel]);
};

/**
 * Genera los elementos para el breakdown de ventas totales
 */
export const useBreakdownItems = (aggregatedMetrics: any) => {
  const { formatCurrency, formatNumber } = useAnalyticsCurrencyFormatting();

  return React.useMemo(
    () => [
      { label: 'Ventas brutas', value: formatCurrency(aggregatedMetrics.totalRevenue) },
      { label: 'Descuentos aplicados', value: formatCurrency(aggregatedMetrics.totalDiscounts) },
      {
        label: 'Ventas netas',
        value: formatCurrency(aggregatedMetrics.totalRevenue - aggregatedMetrics.totalDiscounts),
      },
      { label: 'Productos vendidos', value: formatNumber(aggregatedMetrics.totalProductsSold) },
      { label: 'Productos únicos', value: formatNumber(aggregatedMetrics.uniqueProductsSold) },
      { label: 'Alertas de stock bajo', value: formatNumber(aggregatedMetrics.lowStockAlerts) },
      { label: 'Productos agotados', value: formatNumber(aggregatedMetrics.outOfStockProducts) },
      { label: 'Total de ventas', value: formatCurrency(aggregatedMetrics.totalRevenue) },
    ],
    [aggregatedMetrics, formatCurrency, formatNumber]
  );
};

/**
 * Genera los pasos para el embudo de conversión
 */
export const useConversionSteps = (aggregatedMetrics: any) => {
  const { formatPercentage, formatNumber } = useAnalyticsCurrencyFormatting();

  return React.useMemo(
    () => [
      {
        label: 'Visitantes únicos',
        percentage: '100%',
        count: `${formatNumber(aggregatedMetrics.uniqueVisitors)} visitantes`,
      },
      {
        label: 'Sesiones iniciadas',
        percentage: `${aggregatedMetrics.totalSessions > 0 ? ((aggregatedMetrics.totalSessions / aggregatedMetrics.uniqueVisitors) * 100).toFixed(1) : 0}%`,
        count: `${formatNumber(aggregatedMetrics.totalSessions)} sesiones`,
      },
      {
        label: 'Vistas de tienda',
        percentage: `${aggregatedMetrics.uniqueVisitors > 0 ? ((aggregatedMetrics.storeViews / aggregatedMetrics.uniqueVisitors) * 100).toFixed(1) : 0}%`,
        count: `${formatNumber(aggregatedMetrics.storeViews)} vistas`,
      },
      {
        label: 'Compras completadas',
        percentage: formatPercentage(aggregatedMetrics.conversionRate),
        count: `${formatNumber(aggregatedMetrics.totalOrders)} órdenes`,
      },
    ],
    [aggregatedMetrics, formatPercentage, formatNumber]
  );
};

/**
 * Hook principal que combina toda la lógica de procesamiento de datos
 */
export const useAnalyticsDataProcessing = (analytics: StoreAnalytics[] | null, aggregatedMetrics: any) => {
  // Procesar datos JSON usando el hook genérico
  const deviceData = useJsonSessionData(analytics, 'sessionsByDevice', 'device data');
  const countryData = useJsonSessionData(analytics, 'sessionsByCountry', 'country data');
  const browserData = useJsonSessionData(analytics, 'sessionsByBrowser', 'browser data');
  const referrerData = useJsonSessionData(analytics, 'sessionsByReferrer', 'referrer data');

  // Procesar datos calculados
  const breakdownItems = useBreakdownItems(aggregatedMetrics);
  const conversionSteps = useConversionSteps(aggregatedMetrics);

  return {
    deviceData,
    countryData,
    browserData,
    referrerData,
    breakdownItems,
    conversionSteps,
  };
};
