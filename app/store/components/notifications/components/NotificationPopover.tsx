import { memo } from 'react';
import { TopBar, Badge, Icon, Spinner } from '@shopify/polaris';
import { NotificationIcon } from '@shopify/polaris-icons';
import { useNotificationPopover } from '../hooks';

// Función para formatear la fecha de las notificaciones
const formatNotificationTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Ahora';
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  } else if (diffInMinutes < 1440) {
    // 24 horas
    const hours = Math.floor(diffInMinutes / 60);
    return `Hace ${hours}h`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `Hace ${days}d`;
  }
};

interface NotificationPopoverProps {
  storeId?: string;
}

export const NotificationPopover = memo(({ storeId }: NotificationPopoverProps) => {
  // Usar el hook personalizado para manejar toda la lógica
  const {
    popoverActive,
    togglePopoverActive,
    handlePopoverClose,
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    handleMarkAllAsRead,
    hasNextPage,
    loadMore,
    scrollContainerRef,
  } = useNotificationPopover({
    storeId,
    limit: 50,
  });

  return (
    <TopBar.Menu
      activatorContent={
        <div style={{ position: 'relative' }}>
          <Icon source={NotificationIcon} tone="base" />
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
      open={popoverActive}
      onOpen={togglePopoverActive}
      onClose={handlePopoverClose}
      actions={[
        {
          items: (loading && notifications.length === 0
            ? [
                {
                  content: 'Cargando notificaciones...',
                  disabled: true,
                  prefix: <Spinner size="small" />,
                },
              ]
            : error
              ? [
                  {
                    content: 'Error al cargar notificaciones',
                    disabled: true,
                  },
                ]
              : notifications.length > 0
                ? [
                    // Contenedor con scroll para las notificaciones
                    {
                      content: (
                        <div>
                          <div
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #e1e3e5',
                              backgroundColor: '#f6f6f7',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: '#202223',
                            }}>
                            Notificaciones
                          </div>
                          <div
                            ref={scrollContainerRef}
                            style={{
                              maxHeight: '300px',
                              overflowY: 'auto',
                              padding: '8px 0',
                            }}>
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                style={{
                                  padding: '8px 12px',
                                  borderBottom: '1px solid #e1e3e5',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}>
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
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'flex-start',
                                    }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', flex: 1 }}>
                                      {notification.title || 'Sin título'}
                                    </div>
                                    <div
                                      style={{ fontSize: '11px', color: '#8c9196', marginLeft: '8px', flexShrink: 0 }}>
                                      {formatNotificationTime(notification.createdAt)}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '2px' }}>
                                    {notification.message || 'Sin descripción'}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {loading && notifications.length > 0 && (
                              <div style={{ padding: '12px', textAlign: 'center' }}>
                                <Spinner size="small" />
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>Cargando más...</div>
                              </div>
                            )}
                            {hasNextPage && !loading && (
                              <div
                                style={{
                                  padding: '12px',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  backgroundColor: '#f6f6f7',
                                  borderTop: '1px solid #e1e3e5',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadMore();
                                }}>
                                <div style={{ fontSize: '12px', color: '#007ace' }}>Cargar más notificaciones</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                      disabled: true, // Para que no sea clickeable
                    },
                  ]
                : [
                    {
                      content: 'No tienes notificaciones',
                      disabled: true,
                    },
                  ]) as any,
        },
        {
          items: [
            {
              content: 'Marcar todas como leídas',
              onAction: handleMarkAllAsRead,
              disabled: unreadCount === 0,
            },
          ],
        },
      ]}
    />
  );
});

NotificationPopover.displayName = 'NotificationPopover';
