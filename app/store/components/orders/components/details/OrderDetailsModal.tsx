import { Modal, BlockStack, Divider } from '@shopify/polaris';
import { useState, useEffect } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { OrderHeader } from './OrderHeader';
import { OrderCustomerInfo } from './OrderCustomerInfo';
import { OrderItems } from './OrderItems';
import { OrderPricing } from './OrderPricing';
import { OrderTimeline } from './OrderTimeline';
import { OrderActions } from './OrderActions';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: IOrder | null;
  onUpdateStatus?: (status: string) => Promise<boolean>;
  onUpdatePaymentStatus?: (paymentStatus: string) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
}

export function OrderDetailsModal({
  open,
  onClose,
  order,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDelete,
}: OrderDetailsModalProps) {
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  // Actualizar la orden local cuando cambie el prop o cuando se abra el modal
  useEffect(() => {
    if (order && open) {
      setCurrentOrder(order);
    }
  }, [order, open]);

  if (!currentOrder) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detalles de la Orden #${currentOrder.orderNumber}`}
      size="large"
      primaryAction={{
        content: 'Cerrar',
        onAction: onClose,
      }}>
      <Modal.Section>
        <BlockStack gap="400">
          {/* Header con información principal */}
          <OrderHeader order={currentOrder} />

          <Divider />

          {/* Información del cliente */}
          <OrderCustomerInfo order={currentOrder} />

          <Divider />

          {/* Lista de productos */}
          <OrderItems order={currentOrder} />

          <Divider />

          {/* Información de precios */}
          <OrderPricing order={currentOrder} />

          <Divider />

          {/* Timeline de eventos */}
          <OrderTimeline order={currentOrder} />

          {/* Acciones disponibles */}
          <OrderActions
            order={currentOrder}
            onUpdateStatus={onUpdateStatus}
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onDelete={onDelete}
            onOrderUpdate={setCurrentOrder}
            onClose={onClose}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
