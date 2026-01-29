import { memo } from 'react';
import { Button, Tooltip } from '@shopify/polaris';
import { CheckCircleIcon, FilterIcon } from '@shopify/polaris-icons';

interface NotificationHeaderProps {
  title?: string;
  onMarkAllAsRead?: () => void;
  onFilterClick?: () => void;
  disableMarkAll?: boolean;
  showUnreadOnly?: boolean;
  onToggleUnreadOnly?: () => void;
}

export const NotificationHeader = memo(
  ({
    title = 'Notificaciones',
    onMarkAllAsRead,
    onFilterClick: _onFilterClick,
    disableMarkAll,
    showUnreadOnly,
    onToggleUnreadOnly,
  }: NotificationHeaderProps) => {
    return (
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e1e3e5',
          backgroundColor: '#f6f6f7',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#202223',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
        <span>{title}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip content="Marcar todas como leídas" preferredPosition="mostSpace">
            <span
              tabIndex={0}
              aria-disabled={disableMarkAll}
              title="Marcar todas como leídas"
              style={{ display: 'inline-flex' }}>
              <Button
                icon={CheckCircleIcon}
                variant="tertiary"
                accessibilityLabel="Marcar todas como leídas"
                onClick={onMarkAllAsRead}
                disabled={disableMarkAll}
              />
            </span>
          </Tooltip>
          <Tooltip content={showUnreadOnly ? 'Ver todas' : 'Ver solo no leídas'} preferredPosition="mostSpace">
            <span
              tabIndex={0}
              title={showUnreadOnly ? 'Ver todas' : 'Ver solo no leídas'}
              style={{ display: 'inline-flex' }}>
              <Button
                icon={FilterIcon}
                variant="tertiary"
                accessibilityLabel={showUnreadOnly ? 'Ver todas' : 'Ver solo no leídas'}
                onClick={onToggleUnreadOnly}
              />
            </span>
          </Tooltip>
        </div>
      </div>
    );
  }
);

NotificationHeader.displayName = 'NotificationHeader';
