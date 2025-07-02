import { useState, useCallback } from 'react';
import { TopBar, Badge, Icon } from '@shopify/polaris';
import { NotificationIcon } from '@shopify/polaris-icons';

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
};

interface NotificationPopoverProps {
  notifications?: Notification[];
  onNotificationsChange?: (notifications: Notification[]) => void;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nuevo mensaje',
    description: 'Has recibido un nuevo mensaje de John Doe',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'Actualización del sistema',
    description: 'Mantenimiento programado para mañana',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    title: 'Recordatorio',
    description: 'Reunión con el equipo a las 2 PM',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export const NotificationPopover = ({
  notifications: initialNotifications = dummyNotifications,
  onNotificationsChange,
}: NotificationPopoverProps) => {
  const [popoverActive, setPopoverActive] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const togglePopoverActive = useCallback(() => setPopoverActive((active) => !active), []);

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updatedNotifications);
    onNotificationsChange?.(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));
    setNotifications(updatedNotifications);
    onNotificationsChange?.(updatedNotifications);
    setPopoverActive(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
              <Badge tone="critical-strong">{unreadCount.toString()}</Badge>
            </div>
          )}
        </div>
      }
      open={popoverActive}
      onOpen={togglePopoverActive}
      onClose={togglePopoverActive}
      actions={[
        {
          items:
            notifications.length > 0
              ? notifications.map((notification) => ({
                  content: notification.title,
                  helpText: notification.description,
                  prefix: !notification.read ? <Badge tone="info-strong"> </Badge> : <div style={{ width: '21px' }} />,
                  onAction: () => markAsRead(notification.id),
                }))
              : [
                  {
                    content: 'No tienes notificaciones',
                    disabled: true,
                  },
                ],
        },
        {
          items: [
            {
              content: 'Marcar todas como leídas',
              onAction: markAllAsRead,
              disabled: unreadCount === 0,
            },
          ],
        },
      ]}
    />
  );
};
