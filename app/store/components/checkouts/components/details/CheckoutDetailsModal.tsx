import { Modal, BlockStack, Divider } from '@shopify/polaris';
import { useState } from 'react';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { CheckoutHeader } from './CheckoutHeader';
import { CheckoutCustomerInfo } from './CheckoutCustomerInfo';
import { CheckoutItems } from './CheckoutItems';
import { CheckoutPricing } from './CheckoutPricing';
import { CheckoutTimeline } from './CheckoutTimeline';
import { CheckoutActions } from './CheckoutActions';

interface CheckoutDetailsModalProps {
  checkout: ICheckoutSession | null;
  open: boolean;
  onClose: () => void;
  onComplete?: (id: string) => Promise<void>;
  onExpire?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function CheckoutDetailsModal({
  checkout,
  open,
  onClose,
  onComplete,
  onExpire,
  onCancel,
  onDelete,
}: CheckoutDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!checkout) return null;

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="large"
      primaryAction={{
        content: 'Cerrar',
        onAction: onClose,
        disabled: isLoading,
      }}>
      <Modal.Section>
        <BlockStack gap="600">
          {/* Header con información principal */}
          <CheckoutHeader checkout={checkout} />

          <Divider />

          {/* Información del cliente */}
          <CheckoutCustomerInfo checkout={checkout} />

          <Divider />

          {/* Lista de productos */}
          <CheckoutItems checkout={checkout} />

          <Divider />

          {/* Información de precios */}
          <CheckoutPricing checkout={checkout} />

          <Divider />

          {/* Timeline de eventos */}
          <CheckoutTimeline checkout={checkout} />

          {/* Acciones disponibles */}
          <CheckoutActions
            checkout={checkout}
            isLoading={isLoading}
            onComplete={onComplete ? () => handleAction(() => onComplete(checkout.id)) : undefined}
            onExpire={onExpire ? () => handleAction(() => onExpire(checkout.id)) : undefined}
            onCancel={onCancel ? () => handleAction(() => onCancel(checkout.id)) : undefined}
            onDelete={onDelete ? () => handleAction(() => onDelete(checkout.id)) : undefined}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
