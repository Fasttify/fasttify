import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { useState } from 'react';

export function useOrderSelection() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleSelectAll = (orders: IOrder[]) => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  return {
    selectedOrders,
    setSelectedOrders,
    handleSelectAll,
    handleSelectOrder,
  };
}
