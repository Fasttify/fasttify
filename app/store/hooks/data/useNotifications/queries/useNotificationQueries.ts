import { type StoreSchema } from '@/amplify/data/resource';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { Notification, NotificationFilterOptions, NotificationsQueryResult, PaginationOptions } from '../types';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar las queries de notificaciones
 */
export const useNotificationQueries = (
  storeId: string | undefined,
  options: PaginationOptions,
  filterOptions: NotificationFilterOptions,
  currentPage: number,
  pageTokens: (string | null)[]
) => {
  const queryClient = useQueryClient();
  const { limit, sortDirection, sortField } = options;
  const { type, read, priority } = filterOptions;

  /**
   * Función para obtener notificaciones de una página específica
   */
  const fetchNotificationsPage = async (): Promise<NotificationsQueryResult> => {
    if (!storeId) throw new Error('Store ID is required');

    const token = pageTokens[currentPage - 1];

    // Construir el filtro dinámicamente
    const filter: Record<string, any> = {};
    if (type) filter.type = { eq: type };
    if (read !== undefined) filter.read = { eq: read };
    if (priority) filter.priority = { eq: priority };

    // Usar el índice secundario storeId y createdAt para la paginación y ordenación
    const hasFilters = Object.keys(filter).length > 0;

    const { data, nextToken } = await client.models.Notification.listNotificationByStoreId(
      { storeId },
      {
        ...(hasFilters ? { filter } : {}), // Solo enviar filter si hay condiciones
        limit,
        nextToken: token,
      }
    );

    return {
      notifications: data as Notification[],
      nextToken: nextToken as string | null,
    };
  };

  /**
   * Query principal para obtener notificaciones
   */
  const {
    data,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['notifications', storeId, limit, sortDirection, sortField, currentPage, type, read, priority],
    queryFn: fetchNotificationsPage,
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  /**
   * Función para buscar una notificación específica por ID en caché o API
   */
  const fetchNotificationById = async (id: string): Promise<Notification | null> => {
    if (!storeId) {
      console.error('Cannot get notification: storeId not defined');
      return null;
    }

    const queryCache = queryClient.getQueryCache();
    const notificationQueries = queryCache.findAll({ queryKey: ['notifications', storeId] });

    for (const query of notificationQueries) {
      const pageData = query.state.data as { notifications: Notification[] } | undefined;
      if (pageData?.notifications) {
        const existingNotification = pageData.notifications.find((n: Notification) => n.id === id);
        if (existingNotification) {
          return existingNotification;
        }
      }
    }

    try {
      const { data: notification } = await client.models.Notification.get({ id });

      if (notification) {
        queryClient.setQueryData(['notification', id], notification);
        return notification as Notification;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      return null;
    }
  };

  return {
    data,
    isFetching,
    error: queryError,
    refetch,
    fetchNotificationById,
  };
};
