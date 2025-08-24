import { OrderList } from '../components/listing/OrderList';
import { OrderPage } from './OrderPage';
import { useOrders } from '@/app/store/hooks/data/useOrders';
import { Loading } from '@shopify/polaris';
import { useState } from 'react';
import { useOrderDetailsModal } from '../hooks/useOrderDetailsModal';
import { OrderDetailsModal } from '../components/details/OrderDetailsModal';

interface OrderManagerProps {
  storeId: string;
}

export function OrderManager({ storeId }: OrderManagerProps) {
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const {
    orders,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    currentPage,
    deleteMultipleOrders,
    refreshOrders,
    deleteOrder,
    updateOrderStatus,
    updatePaymentStatus,
  } = useOrders(storeId, { limit: itemsPerPage });

  const { isModalOpen, selectedOrder, openModal, closeModal } = useOrderDetailsModal();

  if (loading) {
    return <Loading />;
  }

  // Mostrar estado vacío solo si no hay órdenes
  if (orders.length === 0 && !loading && !hasPreviousPage) {
    return <OrderPage />;
  }

  return (
    <>
      <OrderList
        storeId={storeId}
        orders={orders}
        loading={loading}
        error={error}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        nextPage={nextPage}
        previousPage={previousPage}
        currentPage={currentPage}
        deleteMultipleOrders={deleteMultipleOrders}
        refreshOrders={refreshOrders}
        deleteOrder={async (id: string) => {
          const result = await deleteOrder(id);
          return !!result;
        }}
        updateOrderStatus={async (id: string, status: string) => {
          const result = await updateOrderStatus(id, status as any);
          return !!result;
        }}
        updatePaymentStatus={async (id: string, paymentStatus: string) => {
          const result = await updatePaymentStatus(id, paymentStatus as any);
          return !!result;
        }}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        onViewDetails={openModal}
      />

      {/* Modal de detalles */}
      <OrderDetailsModal
        open={isModalOpen}
        onClose={closeModal}
        order={selectedOrder}
        onUpdateStatus={
          selectedOrder
            ? async (status) => {
                const result = await updateOrderStatus(selectedOrder.id, status as any);
                return !!result;
              }
            : undefined
        }
        onUpdatePaymentStatus={
          selectedOrder
            ? async (paymentStatus) => {
                const result = await updatePaymentStatus(selectedOrder.id, paymentStatus as any);
                return !!result;
              }
            : undefined
        }
        onDelete={selectedOrder ? () => deleteOrder(selectedOrder.id) : undefined}
      />
    </>
  );
}

export default OrderManager;
