/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-20.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { create } from 'zustand';
import { CONNECTION_STATE_CHANGE, ConnectionState, generateClient } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

// Tipos para las notificaciones
type Notification = Schema['Notification']['type'];
type NotificationType = Notification['type'];
type NotificationPriority = Notification['priority'];

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  connectionState: ConnectionState | null;
  activeSubscription: (() => void) | null;
  storeId: string | null;
  storeOwner: string | null;

  // Acciones
  setStoreContext: (storeId: string, storeOwner: string) => void;
  fetchNotifications: (storeId: string, storeOwner: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearNotifications: () => void;
  setupSubscription: (storeId: string, storeOwner: string) => () => void;
  setConnectionState: (state: ConnectionState) => void;
}

// Escuchar cambios de conexión
Hub.listen('api', (data: any) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const connectionState = payload.data.connectionState as ConnectionState;
    useNotificationStore.getState().setConnectionState(connectionState);
  }
});

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  error: null,
  connectionState: null,
  activeSubscription: null,
  storeId: null,
  storeOwner: null,

  setConnectionState: (state: ConnectionState) => set({ connectionState: state }),

  setStoreContext: (storeId, storeOwner) => {
    const currentState = get();

    if (currentState.storeId === storeId && currentState.storeOwner === storeOwner && !currentState.isLoading) {
      return;
    }

    if (currentState.isLoading && currentState.storeId === storeId) {
      return;
    }

    set({ storeId, storeOwner, isLoading: true, error: null });
  },

  fetchNotifications: async (storeId, storeOwner) => {
    const currentState = get();

    if (currentState.notifications.length > 0 && currentState.storeId === storeId && !currentState.isLoading) {
      return;
    }

    set({ isLoading: true, error: null, storeId, storeOwner });

    try {
      // Usar el índice secundario storeOwner y filtrar por storeId
      const { data: notifications } = await client.models.Notification.listNotificationByStoreId(
        { storeId },
        {
          limit: 50,
        }
      );

      if (notifications) {
        set({
          notifications: notifications as Notification[],
          unreadCount: notifications.filter((n: Notification) => !n.read).length,
          isLoading: false,
        });

        const state = get();
        if (!state.activeSubscription) {
          const unsubscribe = get().setupSubscription(storeId, storeOwner);
          set({ activeSubscription: unsubscribe });
        }
      } else {
        set({
          error: new Error('No se pudieron cargar las notificaciones'),
          isLoading: false,
        });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error al cargar notificaciones'),
        isLoading: false,
      });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await client.models.Notification.update({
        id: notificationId,
        read: true,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error al marcar como leído'),
      });
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadNotifications = notifications.filter((n: Notification) => !n.read);

    try {
      await Promise.all(
        unreadNotifications.map((notification: Notification) =>
          client.models.Notification.update({
            id: notification.id,
            read: true,
          })
        )
      );
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error al marcar todas como leídas'),
      });
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await client.models.Notification.delete({ id: notificationId });
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error al eliminar notificación'),
      });
    }
  },

  clearNotifications: () => {
    const state = get();

    if (state.activeSubscription) {
      state.activeSubscription();
    }

    set({
      notifications: [],
      unreadCount: 0,
      error: null,
      isLoading: true,
      activeSubscription: null,
      storeId: null,
      storeOwner: null,
    });
  },

  setupSubscription: (storeId, storeOwner) => {
    // Suscripción a nuevas notificaciones usando filtro por storeId y storeOwner
    const createSub = client.models.Notification.onCreate({
      filter: {
        storeId: { eq: storeId },
        storeOwner: { eq: storeOwner },
      },
    }).subscribe({
      next: (newNotification) => {
        set((state) => ({
          notifications: [newNotification as Notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      error: (error) => {
        console.error('Error in notification create subscription:', error);
      },
    });

    // Suscripción a actualizaciones de notificaciones
    const updateSub = client.models.Notification.onUpdate({
      filter: {
        storeId: { eq: storeId },
        storeOwner: { eq: storeOwner },
      },
    }).subscribe({
      next: (updatedNotification) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === updatedNotification.id ? (updatedNotification as Notification) : notification
          );

          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n: Notification) => !n.read).length,
          };
        });
      },
      error: (error) => {
        console.error('Error in notification update subscription:', error);
      },
    });

    // Suscripción a eliminaciones de notificaciones
    const deleteSub = client.models.Notification.onDelete({
      filter: {
        storeId: { eq: storeId },
        storeOwner: { eq: storeOwner },
      },
    }).subscribe({
      next: (deletedNotification) => {
        set((state) => {
          const filteredNotifications = state.notifications.filter(
            (notification: Notification) => notification.id !== deletedNotification.id
          );

          return {
            notifications: filteredNotifications,
            unreadCount: filteredNotifications.filter((n: Notification) => !n.read).length,
          };
        });
      },
      error: (error) => {
        console.error('Error in notification delete subscription:', error);
      },
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  },
}));

export default useNotificationStore;

// Hooks especializados
export function useOrderNotifications(storeId: string, storeOwner: string) {
  const store = useNotificationStore();

  const orderNotifications = store.notifications.filter((n: Notification) =>
    ['new_order', 'payment_confirmed', 'status_updated'].includes(n.type ?? '')
  );

  return {
    ...store,
    notifications: orderNotifications,
    unreadCount: orderNotifications.filter((n: Notification) => !n.read).length,
  };
}

export function useSystemNotifications(storeId: string, storeOwner: string) {
  const store = useNotificationStore();

  const systemNotifications = store.notifications.filter(
    (n: Notification) => n.type === 'system_alert' && ['high', 'urgent'].includes(n.priority)
  );

  return {
    ...store,
    notifications: systemNotifications,
    unreadCount: systemNotifications.filter((n: Notification) => !n.read).length,
  };
}

// Utilidades para títulos y mensajes
function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    new_order: '🛒 Nuevo Pedido',
    payment_confirmed: '💳 Pago Confirmado',
    status_updated: '📦 Estado Actualizado',
    system_alert: '⚠️ Alerta del Sistema',
  };
  return titles[type] || '📢 Notificación';
}

function getNotificationMessage(orderData: {
  type: NotificationType;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  customerEmail?: string;
}): string {
  const { type, orderNumber, totalAmount, currency, customerEmail } = orderData;

  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency === 'COP' ? 'COP' : 'USD',
  }).format(totalAmount);

  const messages = {
    new_order: `Pedido #${orderNumber} por ${formattedAmount}${customerEmail ? ` de ${customerEmail}` : ''}`,
    payment_confirmed: `Pago confirmado para el pedido #${orderNumber} por ${formattedAmount}`,
    status_updated: `El pedido #${orderNumber} ha sido actualizado`,
    system_alert: `Alerta del sistema para el pedido #${orderNumber}`,
  };

  return messages[type] || `Notificación para el pedido #${orderNumber}`;
}
