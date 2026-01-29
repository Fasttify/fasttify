import { Badge, BlockStack, Box, Button, ButtonGroup, Checkbox, Text } from '@shopify/polaris';
import { DeleteIcon, CheckIcon, ClockIcon, UndoIcon, CreditCardIcon, ViewIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import type { VisibleColumns } from '@/app/store/components/checkouts/types/checkout-types';
import {
  getStatusText,
  getStatusTone,
  formatExpiryDate,
  getCustomerName,
} from '@/app/store/components/checkouts/utils/checkout-utils';
import { useCheckoutFormatting } from '@/app/store/components/checkouts/hooks/useCheckoutFormatting';

interface CheckoutMobileCardProps {
  checkout: ICheckoutSession;
  selectedCheckouts: string[];
  handleSelectCheckout: (id: string) => void;
  handleDeleteCheckout: (id: string) => void;
  handleCompleteCheckout: (id: string) => void;
  handleExpireCheckout: (id: string) => void;
  handleCancelCheckout: (id: string) => void;
  visibleColumns: VisibleColumns;
  onViewDetails: (checkout: ICheckoutSession) => void;
}

export function CheckoutMobileCard({
  checkout,
  selectedCheckouts,
  handleSelectCheckout,
  handleDeleteCheckout,
  handleCompleteCheckout,
  handleExpireCheckout,
  handleCancelCheckout,
  visibleColumns,
  onViewDetails,
}: CheckoutMobileCardProps) {
  const checkoutId = checkout.id;
  const { formatMoney } = useCheckoutFormatting(checkout.currency ?? undefined);

  return (
    <Box key={checkoutId} padding="300" borderBlockEndWidth="025" borderColor="border">
      <BlockStack gap="150">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ transform: 'scale(0.8)' }}>
              <CreditCardIcon />
            </div>
            <Box>
              <Text variant="bodyMd" as="h3" fontWeight="semibold">
                {checkout.token.substring(0, 8)}...
              </Text>
              {visibleColumns.customer && (
                <Text variant="bodySm" tone="subdued" as="p">
                  {getCustomerName(checkout.customerInfo)}
                </Text>
              )}
            </Box>
          </div>
          <Checkbox
            label=""
            labelHidden
            checked={selectedCheckouts.includes(checkoutId)}
            onChange={() => handleSelectCheckout(checkoutId)}
          />
        </div>

        <Box paddingBlockStart="300" paddingBlockEnd="300">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            {visibleColumns.status && (
              <div style={{ minWidth: '80px', flex: '1 1 auto' }}>
                <Text variant="bodySm" tone="subdued" as="p">
                  Estado
                </Text>
                <Badge tone={getStatusTone(checkout?.status ?? '')}>{getStatusText(checkout?.status ?? '')}</Badge>
              </div>
            )}
            {visibleColumns.total && (
              <div style={{ minWidth: '100px', flex: '1 1 auto' }}>
                <Text variant="bodySm" tone="subdued" as="p">
                  Total
                </Text>
                <Text variant="bodyMd" as="p">
                  {formatMoney(checkout.totalAmount ?? 0)}
                </Text>
              </div>
            )}
            {visibleColumns.expiresAt && (
              <div style={{ minWidth: '120px', flex: '1 1 auto', textAlign: 'right' }}>
                <Text variant="bodySm" tone="subdued" as="p">
                  Expira
                </Text>
                <div style={{ whiteSpace: 'nowrap' }}>
                  <Text variant="bodyMd" as="p">
                    {formatExpiryDate(checkout.expiresAt)}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Box>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Botón Ver Detalles */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              icon={ViewIcon}
              onClick={() => onViewDetails(checkout)}
              accessibilityLabel="Ver detalles"
              variant="plain"
              size="slim">
              Ver Detalles
            </Button>
          </div>

          {/* Botones de acción */}
          {selectedCheckouts.includes(checkoutId) ? (
            <ButtonGroup>
              {checkout.status === 'open' && (
                <>
                  <Button icon={CheckIcon} onClick={() => handleCompleteCheckout(checkoutId)} size="slim">
                    Completar
                  </Button>
                  <Button icon={ClockIcon} onClick={() => handleExpireCheckout(checkoutId)} size="slim">
                    Expirado
                  </Button>
                  <Button icon={UndoIcon} onClick={() => handleCancelCheckout(checkoutId)} size="slim">
                    Cancelar
                  </Button>
                </>
              )}
              <Button
                icon={DeleteIcon}
                onClick={() => handleDeleteCheckout(checkoutId)}
                size="slim"
                variant="plain"
                tone="critical">
                Eliminar
              </Button>
            </ButtonGroup>
          ) : null}
        </div>
      </BlockStack>
    </Box>
  );
}
