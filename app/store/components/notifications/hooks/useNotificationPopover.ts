import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotifications } from '@/app/store/hooks/data/useNotifications';
import useStoreDataStore from '@/context/core/storeDataStore';
import { useNotificationSound } from './useNotificationSound';

interface UseNotificationPopoverProps {
  storeId?: string;
  limit?: number;
  disableScrollListener?: boolean;
}

interface UseNotificationPopoverResult {
  popoverActive: boolean;
  setPopoverActive: (active: boolean) => void;
  togglePopoverActive: () => void;
  handlePopoverClose: () => void;

  notifications: any[];
  loading: boolean;
  error: Error | null;
  unreadCount: number;
  loadingMore: boolean;
  showUnreadOnly: boolean;
  toggleShowUnreadOnly: () => void;

  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  handleMarkAllAsRead: () => Promise<void>;

  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;

  refreshNotifications: () => void;

  playNotificationSound: (notificationType?: string) => void;
}

/**
 * Hook para manejar la lógica del popover de notificaciones
 */
export const useNotificationPopover = ({
  storeId,
  limit = 50,
  disableScrollListener = false,
}: UseNotificationPopoverProps): UseNotificationPopoverResult => {
  const [popoverActive, setPopoverActive] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  const { storeId: contextStoreId } = useStoreDataStore();
  const currentStoreId = storeId || contextStoreId;

  const { notifications, loading, error, markAsRead, markAllAsRead, hasNextPage, loadMore, refreshNotifications } =
    useNotifications(currentStoreId || undefined, {
      limit,
      filterOptions: {
        read: showUnreadOnly ? false : undefined,
      },
      _enabled: !!currentStoreId,
    });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const previousNotificationCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const isLoadingMoreRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playNotificationSound } = useNotificationSound();

  const loadMoreWrapped = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    isLoadingMoreRef.current = true;
    try {
      await loadMore();
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage, loadMore]);

  const togglePopoverActive = useCallback(() => {
    setPopoverActive((active) => !active);
  }, []);

  const toggleShowUnreadOnly = useCallback(() => {
    setShowUnreadOnly((prev) => !prev);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverActive(false);
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    setPopoverActive(false);
  }, [markAllAsRead]);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollContainerRef.current || !hasNextPage || loading || isLoadingMoreRef.current || loadingMore) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        loadMoreWrapped();
      }
    }, 100);
  }, [hasNextPage, loading, loadingMore, loadMoreWrapped]);

  useEffect(() => {
    if (!popoverActive || disableScrollListener) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const timer = setTimeout(() => {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [popoverActive, handleScroll, disableScrollListener]);

  useEffect(() => {
    const currentCount = notifications.length;
    const previousCount = previousNotificationCountRef.current;

    if (!isInitialLoadRef.current && currentCount > previousCount && previousCount > 0) {
      const now = new Date();
      const recentNotifications = notifications.slice(0, currentCount - previousCount);

      const hasRecentNotification = recentNotifications.some((notification) => {
        const createdAt = new Date(notification.createdAt);
        const timeDiff = now.getTime() - createdAt.getTime();
        return timeDiff < 5000;
      });

      if (hasRecentNotification) {
        const mostRecentNotification = recentNotifications[0];
        playNotificationSound(mostRecentNotification.type || '');
      }
    }

    if (isInitialLoadRef.current && currentCount > 0) {
      isInitialLoadRef.current = false;
    }

    previousNotificationCountRef.current = currentCount;
  }, [notifications, playNotificationSound]);

  return {
    popoverActive,
    setPopoverActive,
    togglePopoverActive,
    handlePopoverClose,

    notifications,
    loading,
    error,
    unreadCount,
    loadingMore,
    showUnreadOnly,
    toggleShowUnreadOnly,

    markAsRead,
    markAllAsRead,
    handleMarkAllAsRead,

    hasNextPage,
    loadMore: loadMoreWrapped,
    scrollContainerRef,
    handleScroll,

    refreshNotifications,

    playNotificationSound,
  };
};
