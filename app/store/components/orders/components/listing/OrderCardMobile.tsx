import { Badge, BlockStack, Box, Button, ButtonGroup, Checkbox, Text } from '@shopify/polaris';
import { DeleteIcon, PackageIcon, ViewIcon } from '@shopify/polaris-icons';
import type { VisibleColumns } from '../../types/order-types';
import {
  getStatusText,
  getStatusTone,
  getPaymentStatusText,
  getPaymentStatusTone,
  formatDate,
  getCustomerName,
  getTotalItemsCount,
} from '../../utils/order-utils';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { OrderCardTotal } from './OrderCardTotal';

interface OrderCardMobileProps {
  orders: IOrder[];
  selectedOrders: string[];
  handleSelectOrder: (id: string) => void;
  handleDeleteOrder: (id: string) => void;
  handleUpdateOrderStatus: (id: string, status: string) => void;
  handleUpdatePaymentStatus: (id: string, paymentStatus: string) => void;
  visibleColumns: VisibleColumns;
  onViewDetails: (order: IOrder) => void;
}

export function OrderCardMobile({
  orders,
  selectedOrders,
  handleSelectOrder,
  handleDeleteOrder,
  handleUpdateOrderStatus,
  handleUpdatePaymentStatus,
  visibleColumns,
  onViewDetails,
}: OrderCardMobileProps) {
  return (
    <div className="sm:hidden">
      {orders.map((order) => {
        const orderId = order.id;
        return (
          <Box key={orderId} padding="300" borderBlockEndWidth="025" borderColor="border">
            <BlockStack gap="150">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ transform: 'scale(0.8)' }}>
                    <PackageIcon />
                  </div>
                  <Box>
                    <Text variant="bodyMd" as="h3" fontWeight="semibold">
                      {order.orderNumber}
                    </Text>
                    {visibleColumns.customer && (
                      <Text variant="bodySm" tone="subdued" as="p">
                        {getCustomerName(order.customerInfo)}
                      </Text>
                    )}
                  </Box>
                </div>
                <Checkbox
                  label=""
                  labelHidden
                  checked={selectedOrders.includes(orderId)}
                  onChange={() => handleSelectOrder(orderId)}
                />
              </div>

              <Box paddingBlockStart="300" paddingBlockEnd="300">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  {visibleColumns.status && (
                    <div style={{ minWidth: '80px', flex: '1 1 auto' }}>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Estado
                      </Text>
                      <Badge tone={getStatusTone(order?.status ?? '')}>{getStatusText(order?.status ?? '')}</Badge>
                    </div>
                  )}
                  {visibleColumns.paymentStatus && (
                    <div style={{ minWidth: '80px', flex: '1 1 auto' }}>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Pago
                      </Text>
                      <Badge tone={getPaymentStatusTone(order?.paymentStatus ?? '')}>
                        {getPaymentStatusText(order?.paymentStatus ?? '')}
                      </Badge>
                    </div>
                  )}
                  {visibleColumns.total && (
                    <div style={{ minWidth: '100px', flex: '1 1 auto' }}>
                      <OrderCardTotal order={order} />
                    </div>
                  )}
                  {visibleColumns.creationDate && (
                    <div style={{ minWidth: '120px', flex: '1 1 auto', textAlign: 'right' }}>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Fecha
                      </Text>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        <Text variant="bodyMd" as="p">
                          {formatDate(order.createdAt)}
                        </Text>
                      </div>
                      <Text variant="bodySm" tone="subdued" as="p">
                        {getTotalItemsCount(order.items)} artículos
                      </Text>
                    </div>
                  )}
                </div>
              </Box>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Botón Ver Detalles */}
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    icon={ViewIcon}
                    onClick={() => onViewDetails(order)}
                    accessibilityLabel="Ver detalles"
                    variant="plain"
                    size="slim">
                    Ver Detalles
                  </Button>
                </div>

                {/* Botones de acción */}
                {selectedOrders.includes(orderId) ? (
                  <ButtonGroup>
                    {order.status === 'pending' && (
                      <Button onClick={() => handleUpdateOrderStatus(orderId, 'processing')} size="slim">
                        Procesando
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button onClick={() => handleUpdateOrderStatus(orderId, 'shipped')} size="slim">
                        Enviado
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button onClick={() => handleUpdateOrderStatus(orderId, 'delivered')} size="slim">
                        Entregado
                      </Button>
                    )}
                    {order.paymentStatus === 'pending' && (
                      <Button onClick={() => handleUpdatePaymentStatus(orderId, 'paid')} size="slim">
                        Pagado
                      </Button>
                    )}
                    <Button
                      icon={DeleteIcon}
                      onClick={() => handleDeleteOrder(orderId)}
                      size="slim"
                      variant="plain"
                      tone="critical">
                      Eliminar
                    </Button>
                  </ButtonGroup>
                ) : null}
              </div>
            </BlockStack>
          </Box>
        );
      })}
    </div>
  );
}
