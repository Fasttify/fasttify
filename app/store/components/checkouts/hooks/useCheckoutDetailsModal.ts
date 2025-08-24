import { useState } from 'react';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';

export function useCheckoutDetailsModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<ICheckoutSession | null>(null);

  const openModal = (checkout: ICheckoutSession) => {
    setSelectedCheckout(checkout);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCheckout(null);
  };

  const openModalById = async (checkoutId: string, fetchCheckout: (id: string) => Promise<ICheckoutSession>) => {
    try {
      const checkout = await fetchCheckout(checkoutId);
      setSelectedCheckout(checkout);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar el checkout:', error);
    }
  };

  return {
    isModalOpen,
    selectedCheckout,
    openModal,
    closeModal,
    openModalById,
  };
}
