import { useQueryClient } from '@tanstack/react-query';
import type { ICheckoutSession } from '../types';

/**
 * Utilidades para manejar el caché de sesiones de checkout en React Query
 */
export const useCheckoutSessionCacheUtils = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  /**
   * Actualiza el caché de sesiones de checkout optimísticamente después de una actualización
   */
  const updateCheckoutSessionInCache = (updatedSession: ICheckoutSession) => {
    if (!storeId) return;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['checkoutSessions', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as
          | { checkoutSessions: ICheckoutSession[]; nextToken: string | null }
          | undefined;
        if (oldData?.checkoutSessions.some((s) => s.id === updatedSession.id)) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            checkoutSessions: oldData.checkoutSessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)),
          });
        }
      });
  };

  /**
   * Remueve sesiones de checkout del caché optimísticamente después de una eliminación
   */
  const removeCheckoutSessionsFromCache = (deletedIds: string[]) => {
    if (!storeId) return;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['checkoutSessions', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as
          | { checkoutSessions: ICheckoutSession[]; nextToken: string | null }
          | undefined;
        if (oldData?.checkoutSessions.some((s) => deletedIds.includes(s.id))) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            checkoutSessions: oldData.checkoutSessions.filter((s) => !deletedIds.includes(s.id)),
          });
        }
      });
  };

  /**
   * Busca una sesión de checkout en el caché existente
   */
  const findCheckoutSessionInCache = (id: string): ICheckoutSession | null => {
    if (!storeId) return null;

    const queryCache = queryClient.getQueryCache();
    const checkoutSessionQueries = queryCache.findAll({ queryKey: ['checkoutSessions', storeId] });

    for (const query of checkoutSessionQueries) {
      const pageData = query.state.data as { checkoutSessions: ICheckoutSession[] } | undefined;
      if (pageData?.checkoutSessions) {
        const existingSession = pageData.checkoutSessions.find((s) => s.id === id);
        if (existingSession) {
          return existingSession;
        }
      }
    }

    return null;
  };

  /**
   * Invalida todas las queries de sesiones de checkout para una tienda
   */
  const invalidateCheckoutSessionsCache = () => {
    if (!storeId) return;
    queryClient.invalidateQueries({ queryKey: ['checkoutSessions', storeId] });
  };

  return {
    updateCheckoutSessionInCache,
    removeCheckoutSessionsFromCache,
    findCheckoutSessionInCache,
    invalidateCheckoutSessionsCache,
  };
};
