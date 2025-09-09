import { useState } from 'react';
import type { Notification } from '../types';

/**
 * Hook para manejar el estado de scroll infinito
 */
export const useInfiniteScrollState = () => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  return {
    allNotifications,
    setAllNotifications,
    nextToken,
    setNextToken,
    isLoadingMore,
    setIsLoadingMore,
  };
};

/**
 * Función para limpiar duplicados de notificaciones
 */
export const removeDuplicates = (notifications: Notification[]): Notification[] => {
  const seen = new Set();
  return notifications.filter((notification) => {
    if (seen.has(notification.id)) {
      return false;
    }
    seen.add(notification.id);
    return true;
  });
};

/**
 * Función para agregar nuevas notificaciones evitando duplicados
 */
export const addNotificationsWithoutDuplicates = (
  currentNotifications: Notification[],
  newNotifications: Notification[]
): Notification[] => {
  const existingIds = new Set(currentNotifications.map((n) => n.id));
  const filteredNewNotifications = newNotifications.filter((n) => !existingIds.has(n.id));
  return [...currentNotifications, ...filteredNewNotifications];
};

/**
 * Función para inicializar notificaciones evitando duplicados
 */
export const initializeNotificationsWithoutDuplicates = (
  currentNotifications: Notification[],
  initialNotifications: Notification[]
): Notification[] => {
  const existingIds = new Set(currentNotifications.map((n) => n.id));
  const filteredInitialNotifications = initialNotifications.filter((n) => !existingIds.has(n.id));
  return [...currentNotifications, ...filteredInitialNotifications];
};
