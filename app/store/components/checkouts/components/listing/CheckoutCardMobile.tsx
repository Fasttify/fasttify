import type { VisibleColumns } from '@/app/store/components/checkouts/types/checkout-types';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { CheckoutMobileCard } from '@/app/store/components/checkouts/components/listing/CheckoutMobileCard';

interface CheckoutCardMobileProps {
  checkouts: ICheckoutSession[];
  selectedCheckouts: string[];
  handleSelectCheckout: (id: string) => void;
  handleDeleteCheckout: (id: string) => void;
  handleCompleteCheckout: (id: string) => void;
  handleExpireCheckout: (id: string) => void;
  handleCancelCheckout: (id: string) => void;
  visibleColumns: VisibleColumns;
  onViewDetails: (checkout: ICheckoutSession) => void;
}

export function CheckoutCardMobile({
  checkouts,
  selectedCheckouts,
  handleSelectCheckout,
  handleDeleteCheckout,
  handleCompleteCheckout,
  handleExpireCheckout,
  handleCancelCheckout,
  visibleColumns,
  onViewDetails,
}: CheckoutCardMobileProps) {
  return (
    <div className="sm:hidden">
      {checkouts.map((checkout) => (
        <CheckoutMobileCard
          key={checkout.id}
          checkout={checkout}
          selectedCheckouts={selectedCheckouts}
          handleSelectCheckout={handleSelectCheckout}
          handleDeleteCheckout={handleDeleteCheckout}
          handleCompleteCheckout={handleCompleteCheckout}
          handleExpireCheckout={handleExpireCheckout}
          handleCancelCheckout={handleCancelCheckout}
          visibleColumns={visibleColumns}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
