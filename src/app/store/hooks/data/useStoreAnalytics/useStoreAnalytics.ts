import { useCallback } from 'react';
import type {
  UseStoreAnalyticsOptions,
  UseStoreAnalyticsResult,
  AnalyticsPeriod,
  StoreAnalytics,
} from '@/app/store/hooks/data/useStoreAnalytics/types';
import { useStoreAnalyticsQueries } from '@/app/store/hooks/data/useStoreAnalytics/queries';
import { getTodayDate, getDateRangeForPeriodAnalytics } from '@/app/store/hooks/data/useStoreAnalytics/utils';

/**
 * Hook principal para gestionar analíticas de tienda de forma simplificada
 *
 * @param storeId - ID de la tienda para la que se obtienen las analíticas
 * @param options - Opciones de configuración (opcional)
 * @returns Objeto con analíticas, estado de carga, error y funciones auxiliares
 *
 * @example
 * ```typescript
 * // Uso básico
 * const { analytics, dailyAnalytics, loading } = useStoreAnalytics(storeId);
 *
 * // Con filtros
 * const { analytics } = useStoreAnalytics(storeId, {
 *   filterOptions: {
 *     period: 'monthly',
 *     startDate: '2024-01-01',
 *     endDate: '2024-03-31'
 *   }
 * });
 *
 * // Obtener datos por rango
 * const { getAnalyticsByDateRange } = useStoreAnalytics(storeId);
 * const rangeData = await getAnalyticsByDateRange('2024-01-01', '2024-01-31');
 * ```
 */
export function useStoreAnalytics(
  storeId: string | undefined,
  options?: UseStoreAnalyticsOptions
): UseStoreAnalyticsResult {
  const {
    filterOptions = {},
    enabled = true,
    refetchInterval: _refetchInterval,
    staleTime: _staleTime,
  } = options || {};

  // Configuración de filtros - solo agregar fecha por defecto si no hay otros filtros específicos
  const defaultFilterOptions = {
    ...filterOptions,
    // Solo agregar fecha por defecto si no hay fecha específica, ni rango, ni período
    ...(!filterOptions.date && !filterOptions.startDate && !filterOptions.endDate && !filterOptions.period
      ? { date: getTodayDate() }
      : {}),
  };

  // Usar las queries
  const queries = useStoreAnalyticsQueries(storeId, defaultFilterOptions);

  const { analytics, dailyAnalytics, loading, error, refetch, fetchAnalyticsByDateRange, fetchAnalyticsByPeriod } =
    queries;

  /**
   * Función wrapper para obtener analíticas por rango de fechas
   */
  const getAnalyticsByDateRange = useCallback(
    async (startDate: string, endDate: string): Promise<StoreAnalytics[]> => {
      try {
        return await fetchAnalyticsByDateRange(startDate, endDate);
      } catch (error) {
        console.error('Error fetching analytics by date range:', error);
        throw error;
      }
    },
    [fetchAnalyticsByDateRange]
  );

  /**
   * Función wrapper para obtener analíticas por período
   */
  const getAnalyticsByPeriod = useCallback(
    async (period: AnalyticsPeriod, limit?: number): Promise<StoreAnalytics[]> => {
      try {
        return await fetchAnalyticsByPeriod(period, limit);
      } catch (error) {
        console.error('Error fetching analytics by period:', error);
        throw error;
      }
    },
    [fetchAnalyticsByPeriod]
  );

  /**
   * Función para refrescar todas las analíticas
   */
  const refreshAnalytics = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Datos principales
    analytics: analytics || [],
    dailyAnalytics: dailyAnalytics || null,

    // Estados
    loading: enabled ? loading : false,
    error: error ? new Error(error.message) : null,

    // Funciones
    refetch: refreshAnalytics,
    getAnalyticsByDateRange,
    getAnalyticsByPeriod,
  };
}

/**
 * Hook auxiliar para obtener analíticas de hoy
 */
export function useTodayAnalytics(storeId: string | undefined) {
  return useStoreAnalytics(storeId, {
    filterOptions: {
      date: getTodayDate(),
      period: 'daily',
    },
  });
}

/**
 * Hook auxiliar para obtener analíticas del último mes
 */
export function useMonthlyAnalytics(storeId: string | undefined) {
  const { start, end } = getDateRangeForPeriodAnalytics('monthly');

  return useStoreAnalytics(storeId, {
    filterOptions: {
      startDate: start,
      endDate: end,
      period: 'monthly',
    },
  });
}

/**
 * Hook auxiliar para obtener analíticas de la última semana
 */
export function useWeeklyAnalytics(storeId: string | undefined) {
  const { start, end } = getDateRangeForPeriodAnalytics('weekly');

  return useStoreAnalytics(storeId, {
    filterOptions: {
      startDate: start,
      endDate: end,
      period: 'weekly',
    },
  });
}
