import { Modal, BlockStack, Divider } from '@shopify/polaris';
import { useState, useEffect } from 'react';
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
  const [currentCheckout, setCurrentCheckout] = useState<ICheckoutSession | null>(null);

  // Actualizar el checkout local cuando cambie el prop o cuando se abra el modal
  useEffect(() => {
    if (checkout && open) {
      setCurrentCheckout(checkout);
    }
  }, [checkout, open]);

  if (!currentCheckout) return null;

  const handleAction = async (action: () => Promise<void>, newStatus?: string) => {
    setIsLoading(true);
    try {
      await action();
      // Después de la acción exitosa, actualizar el checkout local
      // para reflejar los cambios inmediatamente
      if (currentCheckout && newStatus) {
        setCurrentCheckout({ ...currentCheckout, status: newStatus as any });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detalles del Checkout #${currentCheckout.token.substring(0, 12)}...`}
      size="large"
      primaryAction={{
        content: 'Cerrar',
        onAction: onClose,
        disabled: isLoading,
      }}>
      <Modal.Section>
        <BlockStack gap="400">
          {/* Header con información principal */}
          <CheckoutHeader checkout={currentCheckout} />

          <Divider />

          {/* Información del cliente */}
          <CheckoutCustomerInfo checkout={currentCheckout} />

          <Divider />

          {/* Lista de productos */}
          <CheckoutItems checkout={currentCheckout} />

          <Divider />

          {/* Información de precios */}
          <CheckoutPricing checkout={currentCheckout} />

          <Divider />

          {/* Timeline de eventos */}
          <CheckoutTimeline checkout={currentCheckout} />

          {/* Acciones disponibles */}
          <CheckoutActions
            checkout={currentCheckout}
            isLoading={isLoading}
            onComplete={onComplete ? () => handleAction(() => onComplete(currentCheckout.id), 'completed') : undefined}
            onExpire={onExpire ? () => handleAction(() => onExpire(currentCheckout.id), 'expired') : undefined}
            onCancel={onCancel ? () => handleAction(() => onCancel(currentCheckout.id), 'cancelled') : undefined}
            onDelete={onDelete ? () => handleAction(() => onDelete(currentCheckout.id)) : undefined}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
