import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '../types';

/**
 * Utilidades para manejar el caché de notificaciones en React Query
 */
export const useNotificationCacheUtils = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  /**
   * Actualiza el caché de notificaciones optimísticamente después de una actualización
   */
  const updateNotificationInCache = (updatedNotification: Notification) => {
    if (!storeId) return;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['notifications', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { notifications: Notification[]; nextToken: string | null } | undefined;
        if (oldData?.notifications.some((n) => n.id === updatedNotification.id)) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            notifications: oldData.notifications.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            ),
          });
        }
      });
  };

  /**
   * Remueve notificaciones del caché optimísticamente después de una eliminación
   */
  const removeNotificationsFromCache = (deletedIds: string[]) => {
    if (!storeId) return;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['notifications', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { notifications: Notification[]; nextToken: string | null } | undefined;
        if (oldData?.notifications.some((n) => deletedIds.includes(n.id))) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            notifications: oldData.notifications.filter((n) => !deletedIds.includes(n.id)),
          });
        }
      });
  };

  /**
   * Busca una notificación en el caché existente
   */
  const findNotificationInCache = (id: string): Notification | null => {
    if (!storeId) return null;

    const queryCache = queryClient.getQueryCache();
    const notificationQueries = queryCache.findAll({ queryKey: ['notifications', storeId] });

    for (const query of notificationQueries) {
      const pageData = query.state.data as { notifications: Notification[] } | undefined;
      if (pageData?.notifications) {
        const existingNotification = pageData.notifications.find((n) => n.id === id);
        if (existingNotification) {
          return existingNotification;
        }
      }
    }

    return null;
  };

  /**
   * Invalida todas las queries de notificaciones para una tienda
   */
  const invalidateNotificationsCache = () => {
    if (!storeId) return;
    queryClient.invalidateQueries({ queryKey: ['notifications', storeId] });
  };

  /**
   * Agrega una notificación nueva al caché optimísticamente
   */
  const addNotificationToCache = (newNotification: Notification) => {
    if (!storeId) return;

    let shouldInvalidateCache = false;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['notifications', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { notifications: Notification[]; nextToken: string | null } | undefined;
        if (oldData?.notifications) {
          // Solo agregar a la primera página si tiene espacio
          if (query.queryKey.includes(1) || query.queryKey.length === 2) {
            // 2 para la queryKey ['notifications', storeId]
            const limit = (query.queryKey[2] as number) || 50; // El limit está en la posición 2

            if (typeof limit !== 'number' || limit <= 0) {
              shouldInvalidateCache = true;
              return;
            }

            if (oldData.notifications.length < limit) {
              // Si la primera página tiene espacio, agregar la notificación
              queryClient.setQueryData(query.queryKey, {
                ...oldData,
                notifications: [newNotification, ...oldData.notifications],
              });
            } else {
              // Si la primera página está llena, marcar para invalidar caché
              shouldInvalidateCache = true;
            }
          }
        }
      });

    if (shouldInvalidateCache) {
      queryClient.invalidateQueries({ queryKey: ['notifications', storeId] });
    }
  };

  return {
    updateNotificationInCache,
    removeNotificationsFromCache,
    findNotificationInCache,
    invalidateNotificationsCache,
    addNotificationToCache,
  };
};
