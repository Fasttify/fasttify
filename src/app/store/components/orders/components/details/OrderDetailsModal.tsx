import { Modal, BlockStack, Divider } from '@shopify/polaris';
import { useState, useEffect, lazy, Suspense } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { OrderHeader } from './OrderHeader';
import { OrderSectionSkeleton, OrderItemsSkeleton } from './OrderSectionSkeleton';

// Lazy load de componentes pesados
const OrderCustomerInfo = lazy(() =>
  import('./OrderCustomerInfo').then((module) => ({ default: module.OrderCustomerInfo }))
);
const OrderItems = lazy(() => import('./OrderItems').then((module) => ({ default: module.OrderItems })));
const OrderPricingWithAPI = lazy(() =>
  import('./OrderPricingWithAPI').then((module) => ({ default: module.OrderPricingWithAPI }))
);
const OrderTimeline = lazy(() => import('./OrderTimeline').then((module) => ({ default: module.OrderTimeline })));
const OrderActions = lazy(() => import('./OrderActions').then((module) => ({ default: module.OrderActions })));

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
      requestAnimationFrame(() => {
        setCurrentOrder(order);
      });
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
          {/* Header con información principal - Se carga inmediatamente */}
          <OrderHeader order={currentOrder} />

          <Divider />

          {/* Información del cliente - Lazy loaded */}
          <Suspense fallback={<OrderSectionSkeleton title="Información del Cliente" lines={4} />}>
            <OrderCustomerInfo order={currentOrder} />
          </Suspense>

          <Divider />

          {/* Lista de productos - Lazy loaded */}
          <Suspense fallback={<OrderItemsSkeleton />}>
            <OrderItems order={currentOrder} />
          </Suspense>

          <Divider />

          {/* Información de precios - Lazy loaded con API */}
          <Suspense fallback={<OrderSectionSkeleton title="Resumen de Precios" lines={6} />}>
            <OrderPricingWithAPI order={currentOrder} />
          </Suspense>

          <Divider />

          {/* Timeline de eventos - Lazy loaded */}
          <Suspense fallback={<OrderSectionSkeleton title="Línea de Tiempo" lines={5} />}>
            <OrderTimeline order={currentOrder} />
          </Suspense>

          {/* Acciones disponibles - Lazy loaded */}
          <Suspense fallback={<OrderSectionSkeleton title="Acciones Disponibles" lines={3} />}>
            <OrderActions
              order={currentOrder}
              onUpdateStatus={onUpdateStatus}
              onUpdatePaymentStatus={onUpdatePaymentStatus}
              onDelete={onDelete}
              onOrderUpdate={setCurrentOrder}
              onClose={onClose}
            />
          </Suspense>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
