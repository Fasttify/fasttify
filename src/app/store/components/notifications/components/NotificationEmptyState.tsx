import { memo } from 'react';
interface NotificationEmptyStateProps {
  message?: string;
}

export const NotificationEmptyState = memo(
  ({ message = 'Las notificaciones de tu tienda aparecerán aquí' }: NotificationEmptyStateProps) => {
    return (
      <div
        style={{
          margin: '12px 16px',
          padding: '12px',
          borderRadius: 8,
          color: '#2c2e30',
          fontSize: '13px',
          lineHeight: 1.35,
        }}>
        {message}
      </div>
    );
  }
);

NotificationEmptyState.displayName = 'NotificationEmptyState';
