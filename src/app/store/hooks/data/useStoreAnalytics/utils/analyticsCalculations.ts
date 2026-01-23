import type { StoreAnalytics } from '@/app/store/hooks/data/useStoreAnalytics/types';

/**
 * Utilidades para calcular métricas agregadas desde los datos de analíticas
 */

/**
 * Suma el total de una métrica específica
 */
export const sumMetric = (analytics: StoreAnalytics[], metric: keyof StoreAnalytics): number => {
  return analytics.reduce((total, item) => {
    const value = item[metric];
    if (typeof value === 'number') {
      return total + value;
    }
    return total;
  }, 0);
};

/**
 * Calcula el promedio de una métrica específica
 */
export const averageMetric = (analytics: StoreAnalytics[], metric: keyof StoreAnalytics): number => {
  if (analytics.length === 0) return 0;

  const total = sumMetric(analytics, metric);
  return total / analytics.length;
};

/**
 * Calcula el porcentaje de retorno de clientes
 */
export const calculateReturningCustomerRate = (analytics: StoreAnalytics[]): number => {
  const totalCustomers = sumMetric(analytics, 'totalCustomers');
  const returningCustomers = sumMetric(analytics, 'returningCustomers');

  if (totalCustomers === 0) return 0;
  return (returningCustomers / totalCustomers) * 100;
};

/**
 * Obtiene el valor más reciente de una métrica
 */
export const getLatestMetric = (analytics: StoreAnalytics[], metric: keyof StoreAnalytics): number => {
  if (analytics.length === 0) return 0;

  // Ordenar por fecha descendente y tomar el más reciente
  const sortedAnalytics = [...analytics].sort((a, b) => b.date.localeCompare(a.date));
  const latestValue = sortedAnalytics[0][metric];

  return typeof latestValue === 'number' ? latestValue : 0;
};

/**
 * Formatea un valor de moneda
 */
export const formatCurrency = (amount: number, currency: string = 'COP'): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea un porcentaje
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calcula métricas agregadas para el período seleccionado
 */
export const calculateAggregatedMetrics = (analytics: StoreAnalytics[]) => {
  return {
    // Métricas de ventas
    totalRevenue: sumMetric(analytics, 'totalRevenue'),
    totalOrders: sumMetric(analytics, 'totalOrders'),
    averageOrderValue: averageMetric(analytics, 'averageOrderValue'),

    // Métricas de clientes
    totalCustomers: sumMetric(analytics, 'totalCustomers'),
    newCustomers: sumMetric(analytics, 'newCustomers'),
    returningCustomers: sumMetric(analytics, 'returningCustomers'),
    returningCustomerRate: calculateReturningCustomerRate(analytics),

    // Métricas de productos
    totalProductsSold: sumMetric(analytics, 'totalProductsSold'),
    uniqueProductsSold: sumMetric(analytics, 'uniqueProductsSold'),

    // Métricas de tráfico
    totalSessions: sumMetric(analytics, 'totalSessions'),
    uniqueVisitors: sumMetric(analytics, 'uniqueVisitors'),
    storeViews: sumMetric(analytics, 'storeViews'),
    conversionRate: averageMetric(analytics, 'conversionRate'),
    bounceRate: averageMetric(analytics, 'bounceRate'),
    avgTimeOnPage: averageMetric(analytics, 'avgTimeOnPage'),

    // Métricas de inventario
    lowStockAlerts: getLatestMetric(analytics, 'lowStockAlerts'),
    outOfStockProducts: getLatestMetric(analytics, 'outOfStockProducts'),

    // Métricas de descuentos
    totalDiscounts: sumMetric(analytics, 'totalDiscounts'),
    discountPercentage: averageMetric(analytics, 'discountPercentage'),
  };
};

/**
 * Parsea datos JSON de las métricas que vienen como string
 */
export const parseJsonMetric = (jsonString: string | null): Record<string, number> => {
  if (!jsonString) return {};

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON metric:', error);
    return {};
  }
};

/**
 * Obtiene el top N de elementos de una métrica JSON
 */
export const getTopItems = (jsonString: string | null, limit: number = 5): Array<{ label: string; value: number }> => {
  const data = parseJsonMetric(jsonString);

  return Object.entries(data)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};
