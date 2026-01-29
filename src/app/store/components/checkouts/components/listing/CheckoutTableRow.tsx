import { Badge, Button, IndexTable, Text, ActionList, Popover } from '@shopify/polaris';
import {
  DeleteIcon,
  CheckIcon,
  ClockIcon,
  UndoIcon,
  SettingsIcon,
  CreditCardIcon,
  ViewIcon,
} from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import type { VisibleColumns } from '@/app/store/components/checkouts/types/checkout-types';
import {
  getStatusText,
  getStatusTone,
  formatDate,
  formatExpiryDate,
  getCustomerName,
  getItemsCount,
} from '@/app/store/components/checkouts/utils/checkout-utils';
import { useCheckoutFormatting } from '@/app/store/components/checkouts/hooks/useCheckoutFormatting';

interface CheckoutTableRowProps {
  checkout: ICheckoutSession;
  index: number;
  isPopoverActive: boolean;
  setActivePopover: (id: string | null) => void;
  visibleColumns: VisibleColumns;
  selectedResources: string[];
  handleDeleteCheckout: (id: string) => void;
  handleCompleteCheckout: (id: string) => void;
  handleExpireCheckout: (id: string) => void;
  handleCancelCheckout: (id: string) => void;
  onViewDetails: (checkout: ICheckoutSession) => void;
}

export function CheckoutTableRow({
  checkout,
  index,
  isPopoverActive,
  setActivePopover,
  visibleColumns,
  selectedResources,
  handleDeleteCheckout,
  handleCompleteCheckout,
  handleExpireCheckout,
  handleCancelCheckout,
  onViewDetails,
}: CheckoutTableRowProps) {
  const { formatMoney } = useCheckoutFormatting(checkout.currency ?? undefined);

  return (
    <IndexTable.Row
      id={checkout.id}
      key={checkout.id}
      selected={selectedResources.includes(checkout.id)}
      position={index}>
      <IndexTable.Cell>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ transform: 'scale(0.8)' }}>
            <CreditCardIcon />
          </div>
          <div>
            <Text variant="bodySm" fontWeight="semibold" as="span">
              {checkout.token.substring(0, 8)}...
            </Text>
            <Text variant="bodySm" tone="subdued" as="span">
              {getItemsCount(checkout.itemsSnapshot)} artículos
            </Text>
          </div>
        </div>
      </IndexTable.Cell>

      {visibleColumns.status && (
        <IndexTable.Cell>
          <Badge tone={getStatusTone(checkout?.status ?? '')}>{getStatusText(checkout?.status ?? '')}</Badge>
        </IndexTable.Cell>
      )}

      {visibleColumns.customer && (
        <IndexTable.Cell>
          <div>
            <Text variant="bodySm" as="span">
              {getCustomerName(checkout.customerInfo)}
            </Text>
            <div style={{ marginTop: '2px' }}>
              <Text variant="bodySm" tone="subdued" as="span">
                {formatDate(checkout.createdAt)}
              </Text>
            </div>
          </div>
        </IndexTable.Cell>
      )}

      {visibleColumns.total && (
        <IndexTable.Cell>
          <Text variant="bodySm" fontWeight="semibold" as="span">
            {formatMoney(checkout.totalAmount ?? 0)}
          </Text>
          <div style={{ marginTop: '2px' }}>
            <Text variant="bodySm" tone="subdued" as="span">
              {formatMoney(checkout.subtotal ?? 0)} + envío
            </Text>
          </div>
        </IndexTable.Cell>
      )}

      {visibleColumns.expiresAt && (
        <IndexTable.Cell>
          <Text variant="bodySm" as="span">
            {formatExpiryDate(checkout.expiresAt)}
          </Text>
        </IndexTable.Cell>
      )}

      {visibleColumns.actions && (
        <IndexTable.Cell>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                icon={ViewIcon}
                onClick={() => onViewDetails(checkout)}
                accessibilityLabel="Ver detalles"
                variant="plain"
                size="slim"
              />
            </div>

            {selectedResources.includes(checkout.id) ? (
              <Popover
                active={isPopoverActive}
                activator={
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      icon={SettingsIcon}
                      onClick={() => setActivePopover(isPopoverActive ? null : checkout.id)}
                      accessibilityLabel="Más opciones"
                      variant="plain"
                    />
                  </div>
                }
                onClose={() => setActivePopover(null)}
                preferredPosition="below"
                preferredAlignment="right">
                <ActionList
                  actionRole="menuitem"
                  items={[
                    {
                      content: 'Completar',
                      icon: CheckIcon,
                      onAction: () => {
                        handleCompleteCheckout(checkout.id);
                        setActivePopover(null);
                      },
                      disabled: checkout.status !== 'open',
                    },
                    {
                      content: 'Marcar como expirado',
                      icon: ClockIcon,
                      onAction: () => {
                        handleExpireCheckout(checkout.id);
                        setActivePopover(null);
                      },
                      disabled: checkout.status !== 'open',
                    },
                    {
                      content: 'Cancelar',
                      icon: UndoIcon,
                      onAction: () => {
                        handleCancelCheckout(checkout.id);
                        setActivePopover(null);
                      },
                      disabled: checkout.status !== 'open',
                    },
                    {
                      content: 'Eliminar',
                      icon: DeleteIcon,
                      destructive: true,
                      onAction: () => {
                        handleDeleteCheckout(checkout.id);
                        setActivePopover(null);
                      },
                    },
                  ]}
                />
              </Popover>
            ) : null}
          </div>
        </IndexTable.Cell>
      )}
    </IndexTable.Row>
  );
}
