import { CheckoutList } from '../components/listing/CheckoutList';
import { CheckoutDetailsModal } from '../components/details/CheckoutDetailsModal';
import { CheckoutPage } from './CheckoutPage';
import { useCheckoutSessions } from '@/app/store/hooks/data/useCheckoutSessions';
import { useCheckoutDetailsModal } from '../hooks/useCheckoutDetailsModal';
import { Loading } from '@shopify/polaris';
import { useState } from 'react';

interface CheckoutManagerProps {
  storeId: string;
}

export function CheckoutManager({ storeId }: CheckoutManagerProps) {
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const {
    checkoutSessions,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    currentPage,
    deleteMultipleCheckoutSessions,
    refreshCheckoutSessions,
    deleteCheckoutSession,
    completeCheckoutSession,
    expireCheckoutSession,
    cancelCheckoutSession,
  } = useCheckoutSessions(storeId, { limit: itemsPerPage });

  // Hook para manejar el modal de detalles
  const { isModalOpen, selectedCheckout, openModal, closeModal } = useCheckoutDetailsModal();

  if (loading) {
    return <Loading />;
  }

  // Mostrar estado vacío solo si no hay checkouts
  if (checkoutSessions.length === 0 && !loading && !hasPreviousPage) {
    return <CheckoutPage />;
  }

  return (
    <>
      <CheckoutList
        storeId={storeId}
        checkouts={checkoutSessions}
        loading={loading}
        error={error}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        nextPage={nextPage}
        previousPage={previousPage}
        currentPage={currentPage}
        deleteMultipleCheckouts={deleteMultipleCheckoutSessions}
        refreshCheckouts={refreshCheckoutSessions}
        deleteCheckout={async (id: string) => {
          const result = await deleteCheckoutSession(id);
          return !!result;
        }}
        completeCheckout={async (id: string) => {
          const result = await completeCheckoutSession(id);
          return !!result;
        }}
        expireCheckout={async (id: string) => {
          const result = await expireCheckoutSession(id);
          return !!result;
        }}
        cancelCheckout={async (id: string) => {
          const result = await cancelCheckoutSession(id);
          return !!result;
        }}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        onViewDetails={openModal}
      />

      {/* Modal de detalles */}
      <CheckoutDetailsModal
        checkout={selectedCheckout}
        open={isModalOpen}
        onClose={closeModal}
        onComplete={async (id: string) => {
          await completeCheckoutSession(id);
        }}
        onExpire={async (id: string) => {
          await expireCheckoutSession(id);
        }}
        onCancel={async (id: string) => {
          await cancelCheckoutSession(id);
        }}
        onDelete={async (id: string) => {
          const result = await deleteCheckoutSession(id);
          if (result) {
            closeModal();
          }
        }}
      />
    </>
  );
}

export default CheckoutManager;
