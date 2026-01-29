import { useState } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';

export function useOrderDetailsModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const openModal = (order: IOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const openModalById = async (orderId: string, fetchOrder: (id: string) => Promise<IOrder>) => {
    try {
      const order = await fetchOrder(orderId);
      setSelectedOrder(order);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar la orden:', error);
    }
  };

  return {
    isModalOpen,
    selectedOrder,
    openModal,
    closeModal,
    openModalById,
  };
}
