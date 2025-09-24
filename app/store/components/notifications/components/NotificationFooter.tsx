import { memo } from 'react';

interface NotificationFooterProps {
  message?: string;
}

export const NotificationFooter = memo(({ message = 'No hay más notificaciones' }: NotificationFooterProps) => {
  return (
    <div style={{ padding: '16px 16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ color: '#6d7175', fontSize: '12px' }}>{message}</div>
    </div>
  );
});

NotificationFooter.displayName = 'NotificationFooter';
