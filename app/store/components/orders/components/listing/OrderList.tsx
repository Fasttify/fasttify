import { useToast } from '@/app/store/context/ToastContext';
import { Box, Card, Text } from '@shopify/polaris';
import { PackageIcon } from '@shopify/polaris-icons';

// Hooks
import { useOrderFilters } from '../../hooks/useOrderFilters';
import { useOrderSelection } from '../../hooks/useOrderSelection';

// Components
import { OrderCardMobile } from './OrderCardMobile';
import { OrderEmptyState } from './OrderEmptyState';
import { OrderFilters } from './OrderFilters';
import { OrderPagination } from './OrderPagination';
import { OrderTableDesktop } from './OrderTableDesktop';

// Types
import type { OrderListProps } from '../../types/order-types';

export function OrderList({
  storeId,
  orders,
  error,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  currentPage,
  deleteMultipleOrders,
  deleteOrder,
  updateOrderStatus,
  updatePaymentStatus,
  itemsPerPage,
  setItemsPerPage,
  onViewDetails,
}: OrderListProps) {
  const { showToast } = useToast();

  // Hooks para manejar diferentes aspectos de la tabla
  const { selectedOrders, handleSelectOrder, setSelectedOrders } = useOrderSelection();
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, sortedOrders, toggleSort, sortDirection, sortField } =
    useOrderFilters(orders);

  // Funciones de acciones
  const handleDeleteOrder = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      const success = await deleteOrder(id);
      if (success) {
        showToast('Orden eliminada correctamente');
        setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));
      } else {
        showToast('Error al eliminar la orden', true);
      }
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const result = await updateOrderStatus(id, status);
      if (result) {
        showToast(`Orden marcada como ${status}`);
      } else {
        showToast('Error al actualizar el estado de la orden', true);
      }
    } catch (error) {
      showToast('Error al actualizar el estado de la orden', true);
    }
  };

  const handleUpdatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      const result = await updatePaymentStatus(id, paymentStatus);
      if (result) {
        showToast(`Estado de pago actualizado a ${paymentStatus}`);
      } else {
        showToast('Error al actualizar el estado del pago', true);
      }
    } catch (error) {
      showToast('Error al actualizar el estado del pago', true);
    }
  };

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} órdenes?`)) {
      const success = await deleteMultipleOrders(selectedIds);
      if (success) {
        showToast(`${selectedIds.length} órdenes eliminadas correctamente`);
        setSelectedOrders([]);
      } else {
        showToast(`Error al eliminar algunas órdenes`, true);
      }
    }
  };

  if (error) {
    return <OrderEmptyState error={error} />;
  }

  return (
    <div className="w-full mt-8">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PackageIcon width={20} height={20} />
            <Text as="h1" variant="headingLg" fontWeight="regular">
              Órdenes
            </Text>
          </div>
          <Text as="p" variant="bodyMd" tone="subdued">
            Administra y controla las órdenes de tus clientes.
          </Text>
        </div>
      </div>

      <Card>
        <OrderFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <OrderTableDesktop
          orders={sortedOrders}
          handleDeleteOrder={handleDeleteOrder}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
          handleUpdatePaymentStatus={handleUpdatePaymentStatus}
          handleDeleteSelected={handleDeleteSelected}
          visibleColumns={{
            order: true,
            status: true,
            paymentStatus: true,
            customer: true,
            total: true,
            creationDate: true,
            actions: true,
          }}
          toggleSort={toggleSort}
          sortDirection={sortDirection === 'asc' ? 'ascending' : 'descending'}
          sortField={sortField ?? 'orderNumber'}
          selectedOrders={selectedOrders}
          handleSelectOrder={handleSelectOrder}
          onViewDetails={onViewDetails}
        />

        {/* Vista móvil */}
        <OrderCardMobile
          orders={sortedOrders}
          selectedOrders={selectedOrders}
          handleSelectOrder={handleSelectOrder}
          handleDeleteOrder={handleDeleteOrder}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
          handleUpdatePaymentStatus={handleUpdatePaymentStatus}
          visibleColumns={{
            order: true,
            status: true,
            paymentStatus: true,
            customer: true,
            total: true,
            creationDate: true,
            actions: true,
          }}
          onViewDetails={onViewDetails}
        />

        <Box padding="400" background="bg-surface">
          <OrderPagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            onNext={nextPage}
            onPrevious={previousPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            currentItemsCount={orders.length}
          />
        </Box>
      </Card>
    </div>
  );
}
