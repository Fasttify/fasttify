import { useMemo } from 'react';
import { StoreAnalytics } from '../types/useStoreAnalytics-types';
import { formatDateForChart } from './dateUtils';

/**
 * Hook para generar datos de gráficos basados en los datos reales de analíticas
 */
export function useAnalyticsChartData(analytics: StoreAnalytics[] | null) {
  return useMemo(() => {
    if (!analytics || analytics.length === 0) {
      return {
        revenueChartData: [],
        ordersChartData: [],
        visitorsChartData: [],
        conversionChartData: [],
        aovChartData: [],
        sessionsChartData: [],
        conversionRateChartData: [],
      };
    }

    // Ordenar por fecha
    const sortedAnalytics = [...analytics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generar datos para gráfico de ingresos
    const revenueChartData = sortedAnalytics.map((item) => ({
      name: formatDateForChart(item.date),
      value: item.totalRevenue || 0,
    }));

    // Generar datos para gráfico de órdenes
    const ordersChartData = sortedAnalytics.map((item) => ({
      name: formatDateForChart(item.date),
      value: item.totalOrders || 0,
    }));

    // Generar datos para gráfico de visitantes únicos
    const visitorsChartData = sortedAnalytics.map((item) => ({
      name: formatDateForChart(item.date),
      value: item.uniqueVisitors || 0,
    }));

    // Generar datos para gráfico de tasa de conversión (para ReturningCustomerRateCard)
    const conversionChartData = sortedAnalytics.map((item) => {
      const totalCustomers = (item.newCustomers || 0) + (item.returningCustomers || 0);
      const returningRate = totalCustomers > 0 ? ((item.returningCustomers || 0) / totalCustomers) * 100 : 0;
      return {
        name: formatDateForChart(item.date),
        value: returningRate,
      };
    });

    // Generar datos para gráfico de valor promedio de orden
    const aovChartData = sortedAnalytics.map((item) => ({
      name: formatDateForChart(item.date),
      value: item.averageOrderValue || 0,
    }));

    // Generar datos para gráfico de sesiones
    const sessionsChartData = sortedAnalytics.map((item) => ({
      name: formatDateForChart(item.date),
      value: item.totalSessions || item.storeViews || 0, // Usar totalSessions o storeViews como fallback
    }));

    // Generar datos para gráfico de tasa de conversión
    const conversionRateChartData = sortedAnalytics.map((item) => ({
      name: formatDateForChart(item.date),
      value: item.conversionRate || 0,
    }));

    return {
      revenueChartData,
      ordersChartData,
      visitorsChartData,
      conversionChartData,
      aovChartData,
      sessionsChartData,
      conversionRateChartData,
    };
  }, [analytics]);
}
