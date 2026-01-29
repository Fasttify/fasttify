import { memo, useCallback, useState } from 'react';
import { Scrollable, Spinner, Button, Tooltip } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  createdAt: string;
  read?: boolean;
}

interface NotificationListProps {
  notifications: NotificationItem[];
  loading: boolean;
  loadingMore?: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onScrolledToBottom?: () => void;
  onItemClick?: (id: string) => void;
  formatTime: (createdAt: string) => string;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationList = memo(
  ({
    notifications,
    loading,
    loadingMore,
    hasNextPage: _hasNextPage,
    onLoadMore: _onLoadMore,
    onScrolledToBottom,
    formatTime,
    onMarkAsRead,
  }: NotificationListProps) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

    const isDisabled = useCallback((n: NotificationItem) => n.read === true || markingIds.has(n.id), [markingIds]);

    const handleMarkClick = useCallback(
      async (id: string, alreadyRead?: boolean) => {
        if (!onMarkAsRead || alreadyRead) return;
        if (markingIds.has(id)) return;
        setMarkingIds((prev) => new Set(prev).add(id));
        try {
          await onMarkAsRead(id);
        } finally {
          setMarkingIds((prev) => new Set(prev).add(id));
        }
      },
      [onMarkAsRead, markingIds]
    );

    return (
      <Scrollable
        style={{
          maxHeight: '300px',
          padding: '8px 0',
        }}
        onScrolledToBottom={onScrolledToBottom}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #e1e3e5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              paddingRight: '40px',
              borderRadius: 6,
              backgroundColor: hoveredId === notification.id ? '#f6f6f7' : 'transparent',
            }}
            onMouseEnter={() => setHoveredId(notification.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === notification.id ? null : prev))}>
            {!notification.read && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#007ace',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              {/* Meta superior y check a la derecha */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ color: '#5a5f66' }}>{formatTime(notification.createdAt)}</div>
              </div>
              {/* Título y descripción */}
              <div style={{ color: '#202223' }}>{notification.title || 'Sin título'}</div>
              <div style={{ color: '#5a5f66', marginTop: 4 }}>{notification.message || 'Sin descripción'}</div>
            </div>

            {/* Botón de marcar como leída, visible al hover */}
            <div
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                opacity: hoveredId === notification.id ? 1 : 0,
                transition: 'opacity 120ms ease-in-out',
                pointerEvents: hoveredId === notification.id ? 'auto' : 'none',
              }}
              onClick={(e) => e.stopPropagation()}>
              {hoveredId === notification.id ? (
                <Tooltip
                  content={isDisabled(notification) ? 'Marcada como leída' : 'Marcar como leída'}
                  preferredPosition="below">
                  <span
                    tabIndex={0}
                    title={isDisabled(notification) ? 'Marcada como leída' : 'Marcar como leída'}
                    style={{ display: 'inline-flex' }}>
                    <Button
                      icon={CheckCircleIcon}
                      variant="tertiary"
                      accessibilityLabel={isDisabled(notification) ? 'Marcada como leída' : 'Marcar como leída'}
                      disabled={isDisabled(notification)}
                      onClick={() => handleMarkClick(notification.id, notification.read)}
                    />
                  </span>
                </Tooltip>
              ) : notification.read ? (
                <span title="Marcada como leída" style={{ display: 'inline-flex', opacity: 0.7 }}>
                  <Button icon={CheckCircleIcon} variant="tertiary" disabled accessibilityLabel="Marcada como leída" />
                </span>
              ) : (
                <span
                  aria-hidden
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '2px solid #c9cccf',
                    display: 'inline-block',
                  }}
                />
              )}
            </div>
          </div>
        ))}
        {(loadingMore || (loading && notifications.length > 0)) && (
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spinner size="small" />
          </div>
        )}
      </Scrollable>
    );
  }
);

NotificationList.displayName = 'NotificationList';
