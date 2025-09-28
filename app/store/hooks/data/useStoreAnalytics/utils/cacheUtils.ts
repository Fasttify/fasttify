import { useQueryClient } from '@tanstack/react-query';
import type { StoreAnalytics } from '@/app/store/hooks/data/useStoreAnalytics/types';

/**
 * Utilidades para manejar el caché de analíticas en React Query
 */
export const useAnalyticsCacheUtils = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  /**
   * Genera una clave de query consistente
   */
  const generateQueryKey = (
    type: 'analytics' | 'analytics-by-date' | 'analytics-by-period' | 'analytics-range',
    params: Record<string, any> = {}
  ): string[] => {
    const baseKey = ['store-analytics', storeId, type];

    // Agregar parámetros de forma consistente
    Object.keys(params)
      .sort() // Ordenar para consistencia
      .forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          baseKey.push(`${key}:${params[key]}`);
        }
      });

    return baseKey as unknown as string[];
  };

  /**
   * Invalida todas las queries de analíticas para una tienda
   */
  const invalidateStoreAnalytics = () => {
    if (!storeId) return;
    queryClient.invalidateQueries({
      queryKey: ['store-analytics', storeId],
    });
  };

  /**
   * Actualiza una analítica específica en el caché
   */
  const updateAnalyticsInCache = (updatedAnalytics: StoreAnalytics) => {
    if (!storeId) return;

    // Actualizar en todas las queries relevantes
    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['store-analytics', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { analytics: StoreAnalytics[] } | StoreAnalytics[] | undefined;

        if (Array.isArray(oldData)) {
          // Formato simple de array
          const updated = oldData.map((item) => (item.id === updatedAnalytics.id ? updatedAnalytics : item));
          queryClient.setQueryData(query.queryKey, updated);
        } else if (oldData && 'analytics' in oldData) {
          // Formato con wrapper object
          const updated = {
            ...oldData,
            analytics: oldData.analytics.map((item) => (item.id === updatedAnalytics.id ? updatedAnalytics : item)),
          };
          queryClient.setQueryData(query.queryKey, updated);
        }
      });
  };

  /**
   * Busca analíticas en el caché existente
   */
  const findAnalyticsInCache = (date?: string, period?: string): StoreAnalytics[] => {
    if (!storeId) return [];

    const queryCache = queryClient.getQueryCache();
    const analyticsQueries = queryCache.findAll({
      queryKey: ['store-analytics', storeId],
    });

    for (const query of analyticsQueries) {
      const data = query.state.data as { analytics: StoreAnalytics[] } | StoreAnalytics[] | undefined;

      if (Array.isArray(data)) {
        return data.filter((item) => {
          if (date && item.date !== date) return false;
          if (period && item.period !== period) return false;
          return true;
        });
      } else if (data && 'analytics' in data) {
        return data.analytics.filter((item) => {
          if (date && item.date !== date) return false;
          if (period && item.period !== period) return false;
          return true;
        });
      }
    }

    return [];
  };

  /**
   * Prefetch de datos para mejorar la experiencia del usuario
   */
  const prefetchAnalytics = async (params: {
    period?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    if (!storeId) return;

    const queryKey = generateQueryKey('analytics', params);

    // Solo hacer prefetch si no está en caché
    const cachedData = queryClient.getQueryData(queryKey);
    if (!cachedData) {
      // Aquí se podría implementar la lógica de prefetch
      // por ahora solo marcamos la intención
      console.log('Prefetching analytics for:', queryKey);
    }
  };

  /**
   * Limpia el caché de analíticas antiguas
   */
  const cleanupOldCache = (olderThanDays: number = 30) => {
    if (!storeId) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['store-analytics', storeId] })
      .forEach((query) => {
        if (query.state.dataUpdatedAt < cutoffDate.getTime()) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
  };

  return {
    generateQueryKey,
    invalidateStoreAnalytics,
    updateAnalyticsInCache,
    findAnalyticsInCache,
    prefetchAnalytics,
    cleanupOldCache,
  };
};
