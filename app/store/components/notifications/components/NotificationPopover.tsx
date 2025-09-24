import { memo, useRef, useMemo } from 'react';
import { Popover, Badge, Spinner, TopBar, Icon } from '@shopify/polaris';
import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';
import { NotificationFooter } from './NotificationFooter';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationIcon } from '@shopify/polaris-icons';
import { useNotificationPopover } from '../hooks';
import { formatNotificationTime } from '../utils/formatNotificationTime';

interface NotificationPopoverProps {
  storeId?: string;
}

export const NotificationPopover = memo(({ storeId }: NotificationPopoverProps) => {
  const {
    popoverActive,
    togglePopoverActive,
    handlePopoverClose,
    notifications,
    loading,
    error,
    loadingMore,
    unreadCount,
    showUnreadOnly,
    toggleShowUnreadOnly,
    markAsRead,
    handleMarkAllAsRead,
    hasNextPage,
    loadMore,
  } = useNotificationPopover({
    storeId,
    limit: 50,
    disableScrollListener: true,
  });

  const isLoadingMoreRef = useRef(false);

  const handleScrolledToBottom = async () => {
    if (!hasNextPage || loading || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    try {
      await loadMore();
    } finally {
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 500);
    }
  };

  const _activatorOffset = useMemo(() => {
    if (typeof window === 'undefined') return 12;
    return window.matchMedia('(max-width: 640px)').matches ? 32 : 12;
  }, []);

  const activator = (
    <TopBar.Menu
      activatorContent={
        <div style={{ position: 'relative' }}>
          <Icon source={NotificationIcon} />
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '-9px',
                right: '0px',
                transform: 'translate(25%, -25%)',
              }}>
              <Badge tone="critical-strong">{unreadCount > 9 ? '+9' : unreadCount.toString()}</Badge>
            </div>
          )}
        </div>
      }
      open={false}
      onOpen={togglePopoverActive}
      onClose={handlePopoverClose}
      actions={[]}
    />
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={() => {
        handlePopoverClose();
      }}
      preferredAlignment="right"
      preferredPosition="mostSpace"
      fixed
      zIndexOverride={300}
      preventCloseOnChildOverlayClick>
      <div style={{ minWidth: 360 }}>
        {loading && notifications.length === 0 ? (
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Spinner size="small" />
            <div>Cargando notificaciones...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '12px 16px' }}>Error al cargar notificaciones</div>
        ) : notifications.length > 0 ? (
          <div>
            <NotificationHeader
              onMarkAllAsRead={handleMarkAllAsRead}
              disableMarkAll={unreadCount === 0}
              showUnreadOnly={showUnreadOnly}
              onToggleUnreadOnly={toggleShowUnreadOnly}
            />
            <NotificationList
              notifications={notifications as any}
              loading={loading}
              loadingMore={loadingMore}
              hasNextPage={hasNextPage}
              onLoadMore={loadMore}
              onScrolledToBottom={handleScrolledToBottom}
              formatTime={formatNotificationTime}
              onMarkAsRead={(id) => markAsRead(id)}
            />
            <NotificationFooter />
          </div>
        ) : (
          <div>
            <NotificationHeader
              onMarkAllAsRead={handleMarkAllAsRead}
              disableMarkAll
              showUnreadOnly={showUnreadOnly}
              onToggleUnreadOnly={toggleShowUnreadOnly}
            />
            <NotificationEmptyState />
          </div>
        )}
      </div>
    </Popover>
  );
});

NotificationPopover.displayName = 'NotificationPopover';
