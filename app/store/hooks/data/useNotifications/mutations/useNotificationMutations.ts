import { useMutation } from '@tanstack/react-query';
import type { Notification } from '../types';
import { useNotificationCacheUtils } from '../utils/notificationCacheUtils';
import { client } from '@/lib/amplify-client';

/**
 * Hook para manejar todas las mutaciones de notificaciones
 */
export const useNotificationMutations = (storeId: string | undefined) => {
  const cacheUtils = useNotificationCacheUtils(storeId);

  /**
   * Mutación para marcar una notificación como leída
   */
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await client.models.Notification.update({
        id: notificationId,
        read: true,
      });
      return data as Notification;
    },
    onSuccess: (updatedNotification) => {
      cacheUtils.updateNotificationInCache(updatedNotification);
    },
  });

  /**
   * Mutación para marcar todas las notificaciones como leídas
   */
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error('Store ID is required');
      // Primero, obtener todas las notificaciones no leídas para la tienda específica
      const { data: unreadNotifications } = await client.models.Notification.listNotificationByStoreId(
        { storeId },
        {
          filter: { read: { eq: false } },
          limit: 100,
        }
      );

      if (unreadNotifications && unreadNotifications.length > 0) {
        await Promise.all(
          unreadNotifications.map(async (notification: Notification) => {
            // Actualizar individualmente
            await client.models.Notification.update({
              id: notification.id,
              read: true,
            });
          })
        );
      }
      // Como el onUpdate ya actualizará el caché individualmente, solo invalidamos para refrescar el conteo
      cacheUtils.invalidateNotificationsCache();
      return true;
    },
    onSuccess: () => {
      // La invalidación del caché ya se maneja en la mutationFn
    },
  });

  /**
   * Mutación para eliminar una notificación
   */
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.models.Notification.delete({ id });
      return id;
    },
    onSuccess: (deletedId) => {
      cacheUtils.removeNotificationsFromCache([deletedId]);
    },
  });

  return {
    markAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
  };
};
