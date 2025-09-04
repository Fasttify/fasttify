import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotifications } from '@/app/store/hooks/data/useNotifications';
import useStoreDataStore from '@/context/core/storeDataStore';
import { useNotificationSound } from './useNotificationSound';

interface UseNotificationPopoverProps {
  storeId?: string;
  limit?: number;
}

interface UseNotificationPopoverResult {
  // Estado del popover
  popoverActive: boolean;
  setPopoverActive: (active: boolean) => void;
  togglePopoverActive: () => void;
  handlePopoverClose: () => void;

  // Datos de notificaciones
  notifications: any[];
  loading: boolean;
  error: Error | null;
  unreadCount: number;

  // Funciones de notificaciones
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  handleMarkAllAsRead: () => Promise<void>;

  // Scroll infinito
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;

  // Refresh
  refreshNotifications: () => void;

  // Sonido
  playNotificationSound: (notificationType?: string) => void;
}

/**
 * Hook para manejar la lógica del popover de notificaciones
 */
export const useNotificationPopover = ({
  storeId,
  limit = 50,
}: UseNotificationPopoverProps): UseNotificationPopoverResult => {
  // Estado del popover
  const [popoverActive, setPopoverActive] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Obtener storeId del contexto si no se proporciona como prop
  const { storeId: contextStoreId } = useStoreDataStore();
  const currentStoreId = storeId || contextStoreId;

  // Hook de notificaciones
  const { notifications, loading, error, markAsRead, markAllAsRead, hasNextPage, loadMore, refreshNotifications } =
    useNotifications(currentStoreId || undefined, {
      limit,
      filterOptions: {
        read: false,
      },
      enabled: !!currentStoreId,
    });

  // Calcular el conteo de no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Ref para rastrear el conteo anterior de notificaciones
  const previousNotificationCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Hook para manejar sonidos de notificaciones
  const { playNotificationSound } = useNotificationSound();

  // Funciones del popover
  const togglePopoverActive = useCallback(() => {
    setPopoverActive((active) => !active);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverActive(false);
  }, []);

  // Callback optimizado para marcar todas como leídas y cerrar el popover
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    setPopoverActive(false);
  }, [markAllAsRead]);

  // Scroll infinito: cargar más notificaciones cuando se llega al final
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !hasNextPage || loading) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px antes del final

    if (isNearBottom) {
      loadMore();
    }
  }, [hasNextPage, loading, loadMore]);

  // Efecto para agregar el listener de scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, popoverActive]);

  // Efecto adicional para asegurar que el listener se agregue cuando el popover se abra
  useEffect(() => {
    if (popoverActive) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [popoverActive, handleScroll]);

  // Efecto para detectar nuevas notificaciones y reproducir sonido
  useEffect(() => {
    const currentCount = notifications.length;
    const previousCount = previousNotificationCountRef.current;

    // Solo reproducir sonido si:
    // 1. No es la carga inicial
    // 2. Hay nuevas notificaciones
    // 3. Las nuevas notificaciones son recientes (creadas en los últimos 5 segundos)
    if (!isInitialLoadRef.current && currentCount > previousCount && previousCount > 0) {
      const now = new Date();
      const recentNotifications = notifications.slice(0, currentCount - previousCount);

      // Verificar si alguna de las nuevas notificaciones es reciente
      const hasRecentNotification = recentNotifications.some((notification) => {
        const createdAt = new Date(notification.createdAt);
        const timeDiff = now.getTime() - createdAt.getTime();
        return timeDiff < 5000; // 5 segundos
      });

      if (hasRecentNotification) {
        // Obtener el tipo de la notificación más reciente
        const mostRecentNotification = recentNotifications[0];
        playNotificationSound(mostRecentNotification.type || '');
      }
    }

    // Marcar que ya no es la carga inicial después del primer render
    if (isInitialLoadRef.current && currentCount > 0) {
      isInitialLoadRef.current = false;
    }

    // Actualizar el conteo anterior
    previousNotificationCountRef.current = currentCount;
  }, [notifications, playNotificationSound]);

  return {
    // Estado del popover
    popoverActive,
    setPopoverActive,
    togglePopoverActive,
    handlePopoverClose,

    // Datos de notificaciones
    notifications,
    loading,
    error,
    unreadCount,

    // Funciones de notificaciones
    markAsRead,
    markAllAsRead,
    handleMarkAllAsRead,

    // Scroll infinito
    hasNextPage,
    loadMore,
    scrollContainerRef,
    handleScroll,

    // Refresh
    refreshNotifications,

    // Sonido
    playNotificationSound,
  };
};
