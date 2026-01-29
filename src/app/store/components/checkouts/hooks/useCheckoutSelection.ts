import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { useState } from 'react';

export function useCheckoutSelection() {
  const [selectedCheckouts, setSelectedCheckouts] = useState<string[]>([]);

  const handleSelectAll = (checkouts: ICheckoutSession[]) => {
    if (selectedCheckouts.length === checkouts.length) {
      setSelectedCheckouts([]);
    } else {
      setSelectedCheckouts(checkouts.map((checkout) => checkout.id));
    }
  };

  const handleSelectCheckout = (id: string) => {
    if (selectedCheckouts.includes(id)) {
      setSelectedCheckouts(selectedCheckouts.filter((checkoutId) => checkoutId !== id));
    } else {
      setSelectedCheckouts([...selectedCheckouts, id]);
    }
  };

  return {
    selectedCheckouts,
    setSelectedCheckouts,
    handleSelectAll,
    handleSelectCheckout,
  };
}
