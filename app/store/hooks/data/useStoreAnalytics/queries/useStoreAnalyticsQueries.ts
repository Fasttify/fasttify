import { type StoreSchema } from '@/amplify/data/resource';
import { useQuery } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type {
  StoreAnalytics,
  AnalyticsFilterOptions,
  AnalyticsPeriod,
} from '@/app/store/hooks/data/useStoreAnalytics/types';
import { useAnalyticsCacheUtils, isValidDateFormat } from '@/app/store/hooks/data/useStoreAnalytics/utils';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar las queries de analíticas de tienda
 */
export const useStoreAnalyticsQueries = (storeId: string | undefined, filterOptions: AnalyticsFilterOptions = {}) => {
  const cacheUtils = useAnalyticsCacheUtils(storeId);
  const { period, startDate, endDate, date } = filterOptions;

  /**
   * Query principal: Obtener analíticas por tienda y período
   */
  const analyticsQuery = useQuery({
    queryKey: cacheUtils.generateQueryKey('analytics', {
      period,
      startDate,
      endDate,
      date,
    }),
    queryFn: async (): Promise<StoreAnalytics[]> => {
      if (!storeId) throw new Error('Store ID is required');

      // Caso 1: Rango de fechas (PRIORIDAD ALTA)
      if (startDate && endDate) {
        if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
          throw new Error('Invalid date format. Use YYYY-MM-DD');
        }

        const { data } = await client.models.StoreAnalytics.analyticsByStoreAndDate(
          {
            storeId,
            date: { between: [startDate, endDate] },
          },
          {
            filter: {
              period: { eq: period },
            },
          }
        );

        return data as StoreAnalytics[];
      }

      // Caso 2: Fecha específica - usar el índice analyticsByStoreAndDate
      if (date) {
        if (!isValidDateFormat(date)) {
          throw new Error('Invalid date format. Use YYYY-MM-DD');
        }

        const { data } = await client.models.StoreAnalytics.analyticsByStoreAndDate(
          {
            storeId,
            date: { eq: date },
          },
          {
            // Si hay period, agregarlo como filter a nivel de DB
            ...(period ? { filter: { period: { eq: period } } } : {}),
          }
        );

        return data as StoreAnalytics[];
      }

      // Caso 3: Solo período específico - usar el índice analyticsByStoreAndPeriod
      if (period) {
        const { data } = await client.models.StoreAnalytics.analyticsByStoreAndPeriod({
          storeId,
          period: { eq: period },
        });
        return data as StoreAnalytics[];
      }

      // Caso 4: Por defecto, últimos datos de la tienda
      const { data } = await client.models.StoreAnalytics.analyticsByStore(
        { storeId },
        {
          limit: 50,
        }
      );
      return data as StoreAnalytics[];
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });

  /**
   * Query para obtener analítica de un día específico
   */
  const dailyAnalyticsQuery = useQuery({
    queryKey: cacheUtils.generateQueryKey('analytics-by-date', {
      date: date || new Date().toISOString().split('T')[0],
    }),
    queryFn: async (): Promise<StoreAnalytics | null> => {
      if (!storeId) throw new Error('Store ID is required');

      const targetDate = date || new Date().toISOString().split('T')[0];

      if (!isValidDateFormat(targetDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }

      // Buscar por fecha específica y luego filtrar por período daily
      const { data } = await client.models.StoreAnalytics.analyticsByStoreAndDate({
        storeId,
        date: { eq: targetDate },
      });

      // Filtrar por período daily
      const dailyData = (data as StoreAnalytics[]).filter((item) => item.period === 'daily');

      return dailyData && dailyData.length > 0 ? dailyData[0] : null;
    },
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutos para datos diarios
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  /**
   * Función para obtener analíticas por rango de fechas (imperativa)
   */
  const fetchAnalyticsByDateRange = async (startDate: string, endDate: string): Promise<StoreAnalytics[]> => {
    if (!storeId) {
      throw new Error('Store ID is required');
    }

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Verificar si ya están en caché
    const cached = cacheUtils.findAnalyticsInCache();
    const filteredCached = cached.filter((item) => item.date >= startDate && item.date <= endDate);

    // Si tenemos todos los datos en caché, devolverlos
    if (filteredCached.length > 0) {
      // Verificar si tenemos datos completos para el rango
      const dateRange = [];
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        dateRange.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      const cachedDates = new Set(filteredCached.map((item) => item.date));
      const hasCompleteRange = dateRange.every((date) => cachedDates.has(date));

      if (hasCompleteRange) {
        return filteredCached.sort((a, b) => a.date.localeCompare(b.date));
      }
    }

    // Si no están en caché, hacer la query usando el índice por fecha
    const { data } = await client.models.StoreAnalytics.analyticsByStoreAndDate({
      storeId,
      date: { between: [startDate, endDate] },
    });

    return data as StoreAnalytics[];
  };

  /**
   * Función para obtener analíticas por período (imperativa)
   */
  const fetchAnalyticsByPeriod = async (period: AnalyticsPeriod, limit: number = 50): Promise<StoreAnalytics[]> => {
    if (!storeId) {
      throw new Error('Store ID is required');
    }

    // Verificar caché primero
    const cached = cacheUtils.findAnalyticsInCache(undefined, period);
    if (cached.length >= limit) {
      return cached.slice(0, limit);
    }

    // Si no está en caché, hacer la query usando el índice por período
    const { data } = await client.models.StoreAnalytics.analyticsByStoreAndPeriod({
      storeId,
      period: { eq: period },
    });

    return data as StoreAnalytics[];
  };

  return {
    // Queries reactivas
    analyticsQuery,
    dailyAnalyticsQuery,

    // Funciones imperativas
    fetchAnalyticsByDateRange,
    fetchAnalyticsByPeriod,

    // Estados derivados
    analytics: analyticsQuery.data || [],
    dailyAnalytics: dailyAnalyticsQuery.data,
    loading: analyticsQuery.isFetching || dailyAnalyticsQuery.isFetching,
    error: analyticsQuery.error || dailyAnalyticsQuery.error,
    refetch: () => {
      analyticsQuery.refetch();
      dailyAnalyticsQuery.refetch();
    },
  };
};
