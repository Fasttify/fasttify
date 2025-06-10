import React, { useState, useCallback } from 'react'
import { Popover, ActionList, Button, Badge } from '@shopify/polaris'
import { NotificationIcon } from '@shopify/polaris-icons'

export type Notification = {
  id: string
  title: string
  description: string
  timestamp: Date
  read: boolean
}

interface NotificationPopoverProps {
  notifications?: Notification[]
  onNotificationsChange?: (notifications: Notification[]) => void
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Message',
    description: 'You have received a new message from John Doe',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'System Update',
    description: 'System maintenance scheduled for tomorrow',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    title: 'Reminder',
    description: 'Meeting with team at 2 PM',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
]

export const NotificationPopover = ({
  notifications: initialNotifications = dummyNotifications,
  onNotificationsChange,
}: NotificationPopoverProps) => {
  const [popoverActive, setPopoverActive] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const togglePopoverActive = useCallback(() => setPopoverActive(active => !active), [])

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    onNotificationsChange?.(updatedNotifications)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({
      ...n,
      read: true,
    }))
    setNotifications(updatedNotifications)
    onNotificationsChange?.(updatedNotifications)
    setPopoverActive(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const activator = (
    <div style={{ position: 'relative' }}>
      <Button
        onClick={togglePopoverActive}
        icon={NotificationIcon}
        accessibilityLabel="Notifications"
      />
      {unreadCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            transform: 'translate(25%, -25%)',
          }}
        >
          <Badge tone="critical">{unreadCount.toString()}</Badge>
        </div>
      )}
    </div>
  )

  const actionListItems =
    notifications.length > 0
      ? notifications.map(notification => ({
          content: notification.title,
          helpText: notification.description,
          prefix: !notification.read ? (
            <Badge tone="attention"> </Badge>
          ) : (
            <div style={{ width: '21px' }} />
          ),
          onAction: () => markAsRead(notification.id),
        }))
      : [
          {
            content: 'You have no notifications',
            disabled: true,
          },
        ]

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      autofocusTarget="first-node"
    >
      <Popover.Pane>
        <ActionList
          actionRole="menuitem"
          sections={[
            {
              title: 'Notifications',
              items: actionListItems,
            },
            {
              items: [
                {
                  content: 'Mark all as read',
                  onAction: markAllAsRead,
                  disabled: unreadCount === 0,
                },
              ],
            },
          ]}
        />
      </Popover.Pane>
    </Popover>
  )
}
