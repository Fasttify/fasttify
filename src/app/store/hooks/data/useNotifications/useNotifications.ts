import { useCallback, useEffect, useState } from 'react';
import type { Notification, UseNotificationsOptions, UseNotificationsResult } from './types';
import {
  useInfiniteScrollState,
  removeDuplicates,
  addNotificationsWithoutDuplicates,
  initializeNotificationsWithoutDuplicates,
} from './utils';
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/api';
import { Hub } from 'aws-amplify/utils';
import { useNotificationMutations } from './mutations';
import { useNotificationQueries } from './queries';
import { client } from '@/lib/clients/amplify-client';

/**
 * Hook para gestionar notificaciones con paginación y caché usando React Query
 * @param storeId - ID de la tienda para la que se gestionan las notificaciones
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con notificaciones, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useNotifications(
  storeId: string | undefined,
  options?: UseNotificationsOptions
): UseNotificationsResult {
  const { limit = 50, filterOptions = {} } = options || {};

  // Estado para scroll infinito
  const { allNotifications, setAllNotifications, nextToken, setNextToken, isLoadingMore, setIsLoadingMore } =
    useInfiniteScrollState();

  const [connectionState, setConnectionState] = useState<ConnectionState>(() => ConnectionState.Disconnected);

  // Mutaciones
  const mutations = useNotificationMutations(storeId);
  const { markAsReadMutation, deleteNotificationMutation } = mutations;

  // Queries - usar solo la primera página para scroll infinito
  const queries = useNotificationQueries(
    storeId,
    { limit, sortDirection: 'DESC', sortField: 'createdAt' as keyof Notification },
    filterOptions,
    1, // Siempre página 1 para scroll infinito
    [null] // Solo el token inicial
  );
  const { data, isFetching, error: queryError, refetch } = queries;

  // Efecto para inicializar las notificaciones
  useEffect(() => {
    setAllNotifications((prev) => initializeNotificationsWithoutDuplicates(prev, data?.notifications || []));
    setNextToken(data?.nextToken ?? null);
  }, [data, setAllNotifications, setNextToken]);

  // Resetear lista y refetch cuando cambian los filtros o el storeId/limit
  useEffect(() => {
    setAllNotifications([]);
    setNextToken(null);
    refetch();
  }, [
    storeId,
    limit,
    filterOptions?.type,
    filterOptions?.read,
    filterOptions?.priority,
    refetch,
    setAllNotifications,
    setNextToken,
  ]);

  // Función para cargar más notificaciones (scroll infinito)
  const loadMore = useCallback(async () => {
    if (!storeId || !nextToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const { type, read, priority } = filterOptions;
      const filter: Record<string, any> = {};
      if (type) filter.type = { eq: type };
      if (read !== undefined) filter.read = { eq: read };
      if (priority) filter.priority = { eq: priority };

      const hasFilters = Object.keys(filter).length > 0;

      const { data: newData, nextToken: newToken } = await client.models.Notification.listNotificationByStoreId(
        { storeId },
        {
          ...(hasFilters ? { filter } : {}),
          limit,
          nextToken,
        }
      );

      // Acumular las nuevas notificaciones, evitando duplicados
      setAllNotifications((prev) => addNotificationsWithoutDuplicates(prev, newData as Notification[]));
      setNextToken(newToken as string | null);
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [storeId, nextToken, isLoadingMore, limit, filterOptions, setAllNotifications, setIsLoadingMore, setNextToken]);

  // Efectos para manejar las suscripciones de AppSync
  useEffect(() => {
    if (!storeId) return;

    // Suscripción para nuevas notificaciones
    const createSub = client.models.Notification.onCreate({
      filter: { storeId: { eq: storeId } },
    }).subscribe({
      next: (newNotification) => {
        // Agregar nueva notificación al estado local
        setAllNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          if (!existingIds.has(newNotification.id)) {
            return [newNotification, ...prev];
          }
          return prev;
        });
      },
      error: (error) => console.error('Error in create subscription:', error),
    });

    // Suscripción para actualizaciones de notificaciones
    const updateSub = client.models.Notification.onUpdate({
      filter: { storeId: { eq: storeId } },
    }).subscribe({
      next: (updatedNotification) => {
        // Actualizar notificación en el estado local
        setAllNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)));
      },
      error: (error) => console.error('Error in update subscription:', error),
    });

    // Suscripción para eliminaciones de notificaciones
    const deleteSub = client.models.Notification.onDelete({
      filter: { storeId: { eq: storeId } },
    }).subscribe({
      next: (deletedNotification) => {
        // Eliminar notificación del estado local
        setAllNotifications((prev) => prev.filter((n) => n.id !== deletedNotification.id));
      },
      error: (error) => console.error('Error in delete subscription:', error),
    });

    // Listener para el estado de conexión de AppSync
    const connectionListener = Hub.listen('api', (data: any) => {
      const { payload } = data;
      if (payload.event === CONNECTION_STATE_CHANGE) {
        setConnectionState(payload.data.connectionState as ConnectionState);
      }
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
      connectionListener();
    };
  }, [storeId, setAllNotifications]);

  // Funciones wrapper para las mutaciones
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadMutation.mutateAsync(notificationId);
        // Actualizar el estado local
        setAllNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
        return true;
      } catch (err) {
        console.error('Error marking notification as read:', err);
        return false;
      }
    },
    [markAsReadMutation, setAllNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      if (!storeId) return false;

      // Obtener solo las notificaciones no leídas del estado local
      const unreadNotifications = allNotifications.filter((n) => !n.read);

      if (unreadNotifications.length === 0) {
        return true; // No hay notificaciones para marcar
      }

      // Actualizar el estado local inmediatamente para mejor UX
      setAllNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      // Dividir en lotes de 25 (límite de DynamoDB)
      const batchSize = 25;
      const notificationIds = unreadNotifications.map((n) => n.id);

      try {
        // Procesar en lotes de 25
        for (let i = 0; i < notificationIds.length; i += batchSize) {
          const batch = notificationIds.slice(i, i + batchSize);
          await client.mutations.BatchMarkNotificationsAsRead({
            notificationIds: batch,
          });
        }
      } catch (error) {
        console.error('Error in batch mutation:', error);
        // Si falla la mutación batch, revertir el estado local
        setAllNotifications((prev) => prev.map((n) => ({ ...n, read: false })));
        throw error;
      }

      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [storeId, allNotifications, setAllNotifications]);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        if (!id) {
          throw new Error('Notification ID is required for deletion');
        }
        await deleteNotificationMutation.mutateAsync(id);
        // Eliminar del estado local
        setAllNotifications((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error('Error deleting notification:', err);
        return false;
      }
    },
    [deleteNotificationMutation, setAllNotifications]
  );

  // Función para refrescar
  const refreshNotifications = useCallback(() => {
    setAllNotifications([]);
    setNextToken(null);
    refetch();
  }, [refetch, setNextToken, setAllNotifications]);

  return {
    notifications: removeDuplicates(allNotifications),
    loading: isFetching,
    error: queryError ? new Error(queryError.message) : null,
    hasNextPage: !!nextToken,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    connectionState,
  };
}
