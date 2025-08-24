import { BlockStack, InlineStack, Text, Card, Button, Icon, Select } from '@shopify/polaris';
import { SettingsIcon } from '@shopify/polaris-icons';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { useState } from 'react';

interface OrderActionsProps {
  order: IOrder;
  onUpdateStatus?: (status: string) => Promise<boolean>;
  onUpdatePaymentStatus?: (paymentStatus: string) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onOrderUpdate?: (updatedOrder: IOrder) => void;
  onClose?: () => void;
}

export function OrderActions({
  order,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDelete,
  onOrderUpdate,
  onClose,
}: OrderActionsProps) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleStatusChange = async (value: string) => {
    if (!onUpdateStatus) return;

    setStatusLoading(true);
    try {
      const success = await onUpdateStatus(value);
      if (success && onOrderUpdate) {
        // Actualizar la orden local inmediatamente
        onOrderUpdate({ ...order, status: value as any });
      }
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePaymentStatusChange = async (value: string) => {
    if (!onUpdatePaymentStatus) return;

    setPaymentStatusLoading(true);
    try {
      const success = await onUpdatePaymentStatus(value);
      if (success && onOrderUpdate) {
        // Actualizar la orden local inmediatamente
        onOrderUpdate({ ...order, paymentStatus: value as any });
      }
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const success = await onDelete();
      if (success && onClose) {
        // Cerrar el modal después de eliminar exitosamente
        onClose();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="300" blockAlign="start">
          <div style={{ marginTop: '2px' }}>
            <Icon source={SettingsIcon} />
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            Acciones Disponibles
          </Text>
        </InlineStack>

        {/* Estado actual de la orden */}
        <BlockStack gap="300">
          {order.status === 'pending' && (
            <Card background="bg-surface-warning">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="caution" as="span">
                  Orden Pendiente
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  La orden está pendiente de procesamiento.
                </Text>
              </BlockStack>
            </Card>
          )}

          {order.status === 'processing' && (
            <Card background="bg-surface-info">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="subdued" as="span">
                  Orden en Proceso
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  La orden está siendo procesada.
                </Text>
              </BlockStack>
            </Card>
          )}

          {order.status === 'shipped' && (
            <Card background="bg-surface-success">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="success" as="span">
                  Orden Enviada
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  La orden ha sido enviada al cliente.
                </Text>
              </BlockStack>
            </Card>
          )}

          {order.status === 'delivered' && (
            <Card background="bg-surface-success">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="success" as="span">
                  Orden Entregada
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  La orden ha sido entregada exitosamente.
                </Text>
              </BlockStack>
            </Card>
          )}

          {order.status === 'cancelled' && (
            <Card background="bg-surface-critical">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="critical" as="span">
                  Orden Cancelada
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  La orden fue cancelada y no se puede procesar.
                </Text>
              </BlockStack>
            </Card>
          )}
        </BlockStack>

        {/* Controles de estado */}
        <BlockStack gap="300">
          <Text variant="bodyMd" fontWeight="medium" as="span">
            Gestionar Estado
          </Text>

          <BlockStack gap="300">
            {onUpdateStatus && (
              <InlineStack gap="300" blockAlign="center">
                <Text variant="bodyMd" as="span">
                  Estado de la orden:
                </Text>
                <Select
                  label=""
                  labelInline
                  options={[
                    { label: 'Pendiente', value: 'pending' },
                    { label: 'Procesando', value: 'processing' },
                    { label: 'Enviado', value: 'shipped' },
                    { label: 'Entregado', value: 'delivered' },
                    { label: 'Cancelado', value: 'cancelled' },
                  ]}
                  value={order.status || 'pending'}
                  onChange={handleStatusChange}
                  disabled={statusLoading}
                />
              </InlineStack>
            )}

            {onUpdatePaymentStatus && (
              <InlineStack gap="300" blockAlign="center">
                <Text variant="bodyMd" as="span">
                  Estado del pago:
                </Text>
                <Select
                  label=""
                  labelInline
                  options={[
                    { label: 'Pendiente', value: 'pending' },
                    { label: 'Pagado', value: 'paid' },
                    { label: 'Fallido', value: 'failed' },
                    { label: 'Reembolsado', value: 'refunded' },
                  ]}
                  value={order.paymentStatus || 'pending'}
                  onChange={handlePaymentStatusChange}
                  disabled={paymentStatusLoading}
                />
              </InlineStack>
            )}
          </BlockStack>
        </BlockStack>

        {/* Botón de eliminar */}
        {onDelete && (
          <BlockStack gap="300">
            <Button tone="critical" size="slim" onClick={handleDelete} loading={deleteLoading}>
              Eliminar Orden
            </Button>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
