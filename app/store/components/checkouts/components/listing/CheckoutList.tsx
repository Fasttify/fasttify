import { useToast } from '@/app/store/context/ToastContext';
import { Box, Card, Text } from '@shopify/polaris';
import { CreditCardIcon } from '@shopify/polaris-icons';

// Hooks
import { useCheckoutFilters } from '../../hooks/useCheckoutFilters';
import { useCheckoutSelection } from '../../hooks/useCheckoutSelection';

// Components
import { CheckoutCardMobile } from './CheckoutCardMobile';
import { CheckoutEmptyState } from './CheckoutEmptyState';
import { CheckoutFilters } from './CheckoutFilters';
import { CheckoutPagination } from './CheckoutPagination';
import { CheckoutTableDesktop } from './CheckoutTableDesktop';

// Types
import type { CheckoutListProps } from '../../types/checkout-types';

export function CheckoutList({
  storeId: _storeId,
  checkouts,
  error,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  currentPage,
  deleteMultipleCheckouts,
  deleteCheckout,
  completeCheckout,
  expireCheckout,
  cancelCheckout,
  itemsPerPage,
  setItemsPerPage,
  onViewDetails,
}: CheckoutListProps) {
  const { showToast } = useToast();

  // Hooks para manejar diferentes aspectos de la tabla
  const { selectedCheckouts, handleSelectCheckout, setSelectedCheckouts } = useCheckoutSelection();
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortedCheckouts,
    toggleSort,
    sortDirection,
    sortField,
  } = useCheckoutFilters(checkouts);

  // Funciones de acciones
  const handleDeleteCheckout = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este checkout?')) {
      const success = await deleteCheckout(id);
      if (success) {
        showToast('Checkout eliminado correctamente');
        setSelectedCheckouts((prev) => prev.filter((checkoutId) => checkoutId !== id));
      } else {
        showToast('Error al eliminar el checkout', true);
      }
    }
  };

  const handleCompleteCheckout = async (id: string) => {
    try {
      const result = await completeCheckout(id);
      if (result) {
        showToast('Checkout marcado como completado');
      } else {
        showToast('Error al completar el checkout', true);
      }
    } catch (_error) {
      showToast('Error al completar el checkout', true);
    }
  };

  const handleExpireCheckout = async (id: string) => {
    try {
      const result = await expireCheckout(id);
      if (result) {
        showToast('Checkout marcado como expirado');
      } else {
        showToast('Error al marcar como expirado', true);
      }
    } catch (_error) {
      showToast('Error al marcar como expirado', true);
    }
  };

  const handleCancelCheckout = async (id: string) => {
    try {
      const result = await cancelCheckout(id);
      if (result) {
        showToast('Checkout cancelado correctamente');
      } else {
        showToast('Error al cancelar el checkout', true);
      }
    } catch (_error) {
      showToast('Error al cancelar el checkout', true);
    }
  };

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} checkouts?`)) {
      const success = await deleteMultipleCheckouts(selectedIds);
      if (success) {
        showToast(`${selectedIds.length} checkouts eliminados correctamente`);
        setSelectedCheckouts([]);
      } else {
        showToast(`Error al eliminar algunos checkouts`, true);
      }
    }
  };

  if (error) {
    return <CheckoutEmptyState error={error} />;
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
            <CreditCardIcon width={20} height={20} />
            <Text as="h1" variant="headingLg" fontWeight="regular">
              Checkouts
            </Text>
          </div>
          <Text as="p" variant="bodyMd" tone="subdued">
            Administra y controla las sesiones de checkout de tus clientes.
          </Text>
        </div>
      </div>

      <Card>
        <CheckoutFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <CheckoutTableDesktop
          checkouts={sortedCheckouts}
          handleDeleteCheckout={handleDeleteCheckout}
          handleCompleteCheckout={handleCompleteCheckout}
          handleExpireCheckout={handleExpireCheckout}
          handleCancelCheckout={handleCancelCheckout}
          handleDeleteSelected={handleDeleteSelected}
          visibleColumns={{
            checkout: true,
            status: true,
            customer: true,
            total: true,
            expiresAt: true,
            actions: true,
          }}
          toggleSort={toggleSort}
          sortDirection={sortDirection === 'asc' ? 'ascending' : 'descending'}
          sortField={sortField ?? 'token'}
          selectedCheckouts={selectedCheckouts}
          handleSelectCheckout={handleSelectCheckout}
          onViewDetails={onViewDetails}
        />

        {/* Vista móvil */}
        <CheckoutCardMobile
          checkouts={sortedCheckouts}
          selectedCheckouts={selectedCheckouts}
          handleSelectCheckout={handleSelectCheckout}
          handleDeleteCheckout={handleDeleteCheckout}
          handleCompleteCheckout={handleCompleteCheckout}
          handleExpireCheckout={handleExpireCheckout}
          handleCancelCheckout={handleCancelCheckout}
          visibleColumns={{
            checkout: true,
            status: true,
            customer: true,
            total: true,
            expiresAt: true,
            actions: true,
          }}
          onViewDetails={onViewDetails}
        />

        <Box padding="400" background="bg-surface">
          <CheckoutPagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            onNext={nextPage}
            onPrevious={previousPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            currentItemsCount={checkouts.length}
          />
        </Box>
      </Card>
    </div>
  );
}
