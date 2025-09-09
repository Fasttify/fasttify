import type { SortField, VisibleColumns } from '../../types/order-types';
import {
  formatCurrency,
  getStatusText,
  getStatusTone,
  getPaymentStatusText,
  getPaymentStatusTone,
  formatDate,
  getCustomerName,
  getTotalItemsCount,
} from '../../utils/order-utils';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { ActionList, Badge, Button, Card, IndexTable, Text, useIndexResourceState, Popover } from '@shopify/polaris';
import { DeleteIcon, SettingsIcon, PackageIcon, ViewIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

interface OrderTableDesktopProps {
  orders: IOrder[];
  handleDeleteOrder: (id: string) => void;
  handleUpdateOrderStatus: (id: string, status: string) => void;
  handleUpdatePaymentStatus: (id: string, paymentStatus: string) => void;
  handleDeleteSelected: (selectedIds: string[]) => void;
  visibleColumns: VisibleColumns;
  toggleSort: (field: SortField) => void;
  sortDirection: 'ascending' | 'descending';
  sortField: SortField;
  selectedOrders: string[];
  handleSelectOrder: (id: string) => void;
  onViewDetails: (order: IOrder) => void;
}

export function OrderTableDesktop({
  orders,
  handleDeleteOrder,
  handleUpdateOrderStatus,
  handleUpdatePaymentStatus,
  handleDeleteSelected,
  visibleColumns,
  toggleSort,
  sortDirection,
  sortField,
  selectedOrders: _selectedOrders,
  handleSelectOrder: _handleSelectOrder,
  onViewDetails,
}: OrderTableDesktopProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const resourceName = {
    singular: 'orden',
    plural: 'órdenes',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orders);

  const promotedBulkActions = [
    {
      content: 'Eliminar órdenes',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ];

  const rowMarkup = orders.map((order, index) => {
    const isPopoverActive = activePopover === order.id;

    return (
      <IndexTable.Row id={order.id} key={order.id} selected={selectedResources.includes(order.id)} position={index}>
        <IndexTable.Cell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ transform: 'scale(0.8)' }}>
              <PackageIcon />
            </div>
            <div>
              <Text variant="bodySm" fontWeight="semibold" as="span">
                {order.orderNumber}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {getTotalItemsCount(order.items)} artículos
              </Text>
            </div>
          </div>
        </IndexTable.Cell>

        {visibleColumns.status && (
          <IndexTable.Cell>
            <Badge tone={getStatusTone(order?.status ?? '')}>{getStatusText(order?.status ?? '')}</Badge>
          </IndexTable.Cell>
        )}

        {visibleColumns.paymentStatus && (
          <IndexTable.Cell>
            <Badge tone={getPaymentStatusTone(order?.paymentStatus ?? '')}>
              {getPaymentStatusText(order?.paymentStatus ?? '')}
            </Badge>
          </IndexTable.Cell>
        )}

        {visibleColumns.customer && (
          <IndexTable.Cell>
            <div>
              <Text variant="bodySm" as="span">
                {getCustomerName(order.customerInfo)}
              </Text>
              <div style={{ marginTop: '2px' }}>
                <Text variant="bodySm" tone="subdued" as="span">
                  {formatDate(order.createdAt)}
                </Text>
              </div>
            </div>
          </IndexTable.Cell>
        )}

        {visibleColumns.total && (
          <IndexTable.Cell>
            <Text variant="bodySm" fontWeight="semibold" as="span">
              {formatCurrency(order.totalAmount ?? 0, order.currency ?? 'COP')}
            </Text>
            <div style={{ marginTop: '2px' }}>
              <Text variant="bodySm" tone="subdued" as="span">
                {formatCurrency(order.subtotal ?? 0, order.currency ?? 'COP')} + envío
              </Text>
            </div>
          </IndexTable.Cell>
        )}

        {visibleColumns.creationDate && (
          <IndexTable.Cell>
            <Text variant="bodySm" as="span">
              {formatDate(order.createdAt)}
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
                    onViewDetails(order);
                  }}
                  accessibilityLabel="Ver detalles"
                  variant="plain"
                  size="slim"
                />
              </div>

              {/* Popover de acciones */}
              {selectedResources.includes(order.id) ? (
                <Popover
                  active={isPopoverActive}
                  activator={
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        icon={SettingsIcon}
                        onClick={() => setActivePopover(isPopoverActive ? null : order.id)}
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
                        content: 'Marcar como Procesando',
                        onAction: () => {
                          handleUpdateOrderStatus(order.id, 'processing');
                          setActivePopover(null);
                        },
                        disabled: order.status !== 'pending',
                      },
                      {
                        content: 'Marcar como Enviado',
                        onAction: () => {
                          handleUpdateOrderStatus(order.id, 'shipped');
                          setActivePopover(null);
                        },
                        disabled: order.status !== 'processing',
                      },
                      {
                        content: 'Marcar como Entregado',
                        onAction: () => {
                          handleUpdateOrderStatus(order.id, 'delivered');
                          setActivePopover(null);
                        },
                        disabled: order.status !== 'shipped',
                      },
                      {
                        content: 'Marcar como Pagado',
                        onAction: () => {
                          handleUpdatePaymentStatus(order.id, 'paid');
                          setActivePopover(null);
                        },
                        disabled: order.paymentStatus !== 'pending',
                      },
                      {
                        content: 'Eliminar',
                        icon: DeleteIcon,
                        destructive: true,
                        onAction: () => {
                          handleDeleteOrder(order.id);
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

  const headings: { title: string }[] = [{ title: 'Orden' }];
  const sortableColumns: SortField[] = ['orderNumber'];

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' });
    sortableColumns.push('status');
  }
  if (visibleColumns.paymentStatus) {
    headings.push({ title: 'Pago' });
    sortableColumns.push('paymentStatus');
  }
  if (visibleColumns.customer) {
    headings.push({ title: 'Cliente' });
    sortableColumns.push('creationDate');
  }
  if (visibleColumns.total) {
    headings.push({ title: 'Total' });
    sortableColumns.push('totalAmount');
  }
  if (visibleColumns.creationDate) {
    headings.push({ title: 'Fecha' });
    sortableColumns.push('creationDate');
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField);

  return (
    <div className="hidden sm:block">
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={orders.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          headings={headings as [{ title: string }]}
          sortable={[true, true, true, true, true, true, false]}
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
