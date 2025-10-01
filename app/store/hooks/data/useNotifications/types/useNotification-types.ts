import { ConnectionState } from 'aws-amplify/api';
import { type StoreNotification } from '@/lib/amplify-client';

/**
 * Interfaz para representar una notificación
 */
export type Notification = StoreNotification;

/**
 * Tipo para los datos necesarios al crear una notificación
 */
export type NotificationCreateInput = Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'store'>;

/**
 * Tipo para los datos al actualizar una notificación
 */
export type NotificationUpdateInput = Partial<
  Omit<Notification, 'store' | 'createdAt' | 'updatedAt' | 'storeOwner' | 'storeId' | 'order'>
> & {
  id: string;
};

/**
 * Opciones para filtrar notificaciones
 */
export interface NotificationFilterOptions {
  type?: Notification['type'];
  read?: boolean;
  priority?: Notification['priority'];
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  limit?: number;
  sortDirection?: 'ASC' | 'DESC';
  sortField?: keyof Notification;
}

/**
 * Resultado del hook useNotifications
 */
export interface UseNotificationsResult {
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  refreshNotifications: () => void;
  connectionState: ConnectionState;
}

/**
 * Opciones de paginación y configuración
 */
export interface UseNotificationsOptions extends PaginationOptions {
  skipInitialFetch?: boolean;
  _enabled?: boolean;
  filterOptions?: NotificationFilterOptions;
}

/**
 * Resultado de la consulta de notificaciones
 */
export interface NotificationsQueryResult {
  notifications: Notification[];
  nextToken: string | null;
}
