import { Modal, BlockStack, Divider } from '@shopify/polaris';
import { useState, useEffect, lazy, Suspense } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { OrderHeaderOptimized } from '@/app/store/components/orders/components/details/OrderHeaderOptimized';
import {
  OrderSectionSkeleton,
  OrderItemsSkeleton,
} from '@/app/store/components/orders/components/details/OrderSectionSkeleton';
import { useOrderDataPreprocessing } from '@/app/store/components/orders/hooks/useOrderDataPreprocessing';

// Lazy load de componentes optimizados
const OrderCustomerInfoOptimized = lazy(() =>
  import('./OrderCustomerInfoOptimized').then((module) => ({ default: module.OrderCustomerInfoOptimized }))
);
const OrderItemsOptimized = lazy(() =>
  import('./OrderItemsOptimized').then((module) => ({ default: module.OrderItemsOptimized }))
);
const OrderPricingWithAPI = lazy(() =>
  import('./OrderPricingWithAPI').then((module) => ({ default: module.OrderPricingWithAPI }))
);
const OrderTimelineOptimized = lazy(() =>
  import('./OrderTimelineOptimized').then((module) => ({ default: module.OrderTimelineOptimized }))
);
const OrderActions = lazy(() => import('./OrderActions').then((module) => ({ default: module.OrderActions })));

interface OrderDetailsModalOptimizedProps {
  open: boolean;
  onClose: () => void;
  order: IOrder | null;
  onUpdateStatus?: (status: string) => Promise<boolean>;
  onUpdatePaymentStatus?: (paymentStatus: string) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
}

export function OrderDetailsModalOptimized({
  open,
  onClose,
  order,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDelete,
}: OrderDetailsModalOptimizedProps) {
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  // Pre-procesar todos los datos de la orden
  const processedOrderData = useOrderDataPreprocessing(currentOrder);

  // Actualizar la orden local cuando cambie el prop o cuando se abra el modal
  useEffect(() => {
    if (order && open) {
      requestAnimationFrame(() => {
        setCurrentOrder(order);
      });
    }
  }, [order, open]);

  if (!currentOrder || !processedOrderData) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detalles de la Orden #${processedOrderData.orderNumber}`}
      size="large"
      primaryAction={{
        content: 'Cerrar',
        onAction: onClose,
      }}>
      <Modal.Section>
        <BlockStack gap="400">
          {/* Header con información principal - Se carga inmediatamente con datos pre-procesados */}
          <OrderHeaderOptimized orderData={processedOrderData} />

          <Divider />

          {/* Información del cliente - Lazy loaded con datos pre-procesados */}
          <Suspense fallback={<OrderSectionSkeleton title="Información del Cliente" lines={4} />}>
            <OrderCustomerInfoOptimized
              customerData={processedOrderData.customerData}
              notes={processedOrderData.notes || ''}
            />
          </Suspense>

          <Divider />

          {/* Lista de productos - Lazy loaded con datos pre-procesados */}
          <Suspense fallback={<OrderItemsSkeleton />}>
            <OrderItemsOptimized items={processedOrderData.items} />
          </Suspense>

          <Divider />

          {/* Información de precios - Lazy loaded con API */}
          <Suspense fallback={<OrderSectionSkeleton title="Resumen de Precios" lines={6} />}>
            <OrderPricingWithAPI order={currentOrder} />
          </Suspense>

          <Divider />

          {/* Timeline de eventos - Lazy loaded con datos pre-procesados */}
          <Suspense fallback={<OrderSectionSkeleton title="Línea de Tiempo" lines={5} />}>
            <OrderTimelineOptimized
              timelineEvents={processedOrderData.timelineEvents}
              status={processedOrderData.status}
              paymentStatus={processedOrderData.paymentStatus}
            />
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
