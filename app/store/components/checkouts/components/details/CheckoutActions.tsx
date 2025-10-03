import { BlockStack, InlineStack, Text, Card, Button, ButtonGroup, Icon } from '@shopify/polaris';
import { CheckIcon, ClockIcon, UndoIcon, DeleteIcon, SettingsIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';

interface CheckoutActionsProps {
  checkout: ICheckoutSession;
  isLoading: boolean;
  onComplete?: () => void;
  onExpire?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function CheckoutActions({
  checkout,
  isLoading,
  onComplete,
  onExpire,
  onCancel,
  onDelete,
}: CheckoutActionsProps) {
  const isOpen = checkout.status === 'open';
  const canModify = isOpen || checkout.status === 'expired';

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="300" blockAlign="start">
          <div style={{ marginTop: '2px' }}>
            <Icon source={SettingsIcon} />
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            Acciones Disponibles
          </Text>
        </InlineStack>

        {/* Acciones principales */}
        <BlockStack gap="300">
          {isOpen && (
            <Card background="bg-surface-info">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="caution" as="span">
                  Checkout Activo
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  El cliente puede continuar con el proceso de pago.
                </Text>
              </BlockStack>
            </Card>
          )}

          {checkout.status === 'completed' && (
            <Card background="bg-surface-success">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="success" as="span">
                  Checkout Completado
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  El checkout fue procesado exitosamente.
                </Text>
              </BlockStack>
            </Card>
          )}

          {checkout.status === 'expired' && (
            <Card background="bg-surface-warning">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="critical" as="span">
                  Checkout Expirado
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  El checkout expiró y ya no está disponible para el cliente.
                </Text>
              </BlockStack>
            </Card>
          )}

          {checkout.status === 'cancelled' && (
            <Card background="bg-surface-critical">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" tone="critical" as="span">
                  Checkout Cancelado
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  El checkout fue cancelado y no se puede procesar.
                </Text>
              </BlockStack>
            </Card>
          )}
        </BlockStack>

        {/* Botones de acción */}
        {canModify && (
          <BlockStack gap="300">
            <Text variant="bodyMd" fontWeight="medium" as="span">
              Gestionar Estado
            </Text>

            <ButtonGroup>
              {isOpen && onComplete && (
                <Button
                  icon={CheckIcon}
                  onClick={onComplete}
                  loading={isLoading}
                  variant="primary"
                  tone="success"
                  disabled={isLoading}>
                  Marcar como Completado
                </Button>
              )}

              {isOpen && onExpire && (
                <Button icon={ClockIcon} onClick={onExpire} loading={isLoading} tone="critical" disabled={isLoading}>
                  Marcar como Expirado
                </Button>
              )}

              {isOpen && onCancel && (
                <Button icon={UndoIcon} onClick={onCancel} loading={isLoading} tone="critical" disabled={isLoading}>
                  Cancelar Checkout
                </Button>
              )}

              {onDelete && (
                <Button
                  icon={DeleteIcon}
                  onClick={onDelete}
                  loading={isLoading}
                  variant="plain"
                  tone="critical"
                  disabled={isLoading}>
                  Eliminar Checkout
                </Button>
              )}
            </ButtonGroup>
          </BlockStack>
        )}

        {/* Información adicional */}
        <BlockStack gap="200">
          <Text variant="bodySm" tone="subdued" as="span">
            Token: {checkout.token}
          </Text>
          {checkout.storeOwner && (
            <Text variant="bodySm" tone="subdued" as="span">
              Propietario: {checkout.storeOwner}
            </Text>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
