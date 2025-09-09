import type { SortField, VisibleColumns } from '../../types/checkout-types';
import {
  formatCurrency,
  getStatusText,
  getStatusTone,
  formatDate,
  formatExpiryDate,
  getCustomerName,
  getItemsCount,
} from '../../utils/checkout-utils';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { ActionList, Badge, Button, Card, IndexTable, Text, useIndexResourceState, Popover } from '@shopify/polaris';
import {
  DeleteIcon,
  CheckIcon,
  ClockIcon,
  UndoIcon,
  SettingsIcon,
  CreditCardIcon,
  ViewIcon,
} from '@shopify/polaris-icons';
import { useState } from 'react';

interface CheckoutTableDesktopProps {
  checkouts: ICheckoutSession[];
  handleDeleteCheckout: (id: string) => void;
  handleCompleteCheckout: (id: string) => void;
  handleExpireCheckout: (id: string) => void;
  handleCancelCheckout: (id: string) => void;
  handleDeleteSelected: (selectedIds: string[]) => void;
  visibleColumns: VisibleColumns;
  toggleSort: (field: SortField) => void;
  sortDirection: 'ascending' | 'descending';
  sortField: SortField;
  selectedCheckouts: string[];
  handleSelectCheckout: (id: string) => void;
  onViewDetails: (checkout: ICheckoutSession) => void;
}

export function CheckoutTableDesktop({
  checkouts,
  handleDeleteCheckout,
  handleCompleteCheckout,
  handleExpireCheckout,
  handleCancelCheckout,
  handleDeleteSelected,
  visibleColumns,
  toggleSort,
  sortDirection,
  sortField,
  selectedCheckouts: _selectedCheckouts,
  handleSelectCheckout: _handleSelectCheckout,
  onViewDetails,
}: CheckoutTableDesktopProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const resourceName = {
    singular: 'checkout',
    plural: 'checkouts',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(checkouts);

  const promotedBulkActions = [
    {
      content: 'Eliminar checkouts',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ];

  const rowMarkup = checkouts.map((checkout, index) => {
    const isPopoverActive = activePopover === checkout.id;

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
              {formatCurrency(checkout.totalAmount ?? 0, checkout.currency ?? 'COP')}
            </Text>
            <div style={{ marginTop: '2px' }}>
              <Text variant="bodySm" tone="subdued" as="span">
                {formatCurrency(checkout.subtotal ?? 0, checkout.currency ?? 'COP')} + envío
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
              {/* Botón Ver Detalles */}
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  icon={ViewIcon}
                  onClick={() => {
                    onViewDetails(checkout);
                  }}
                  accessibilityLabel="Ver detalles"
                  variant="plain"
                  size="slim"
                />
              </div>

              {/* Popover de acciones */}
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
  });

  const headings: { title: string }[] = [{ title: 'Checkout' }];
  const sortableColumns: SortField[] = ['token'];

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' });
    sortableColumns.push('status');
  }
  if (visibleColumns.customer) {
    headings.push({ title: 'Cliente' });
    sortableColumns.push('creationDate');
  }
  if (visibleColumns.total) {
    headings.push({ title: 'Total' });
    sortableColumns.push('totalAmount');
  }
  if (visibleColumns.expiresAt) {
    headings.push({ title: 'Expira' });
    sortableColumns.push('expiresAt');
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField);

  return (
    <div className="hidden sm:block">
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={checkouts.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          headings={headings as [{ title: string }]}
          sortable={[true, true, true, true, true, false]}
          sortDirection={sortDirection}
          sortColumnIndex={sortColumnIndex}
          onSort={(index) => {
            const field = sortableColumns[index];
            if (field) {
              toggleSort(field);
            }
          }}>
          {rowMarkup}
        </IndexTable>
      </Card>
    </div>
  );
}
