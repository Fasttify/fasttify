import { Badge, BlockStack, Box, Button, ButtonGroup, Checkbox, Text } from '@shopify/polaris';
import { DeleteIcon, CheckIcon, ClockIcon, UndoIcon, CreditCardIcon, ViewIcon } from '@shopify/polaris-icons';

import type { VisibleColumns } from '../../types/checkout-types';
import {
  getStatusText,
  getStatusTone,
  formatCurrency,
  formatExpiryDate,
  getCustomerName,
} from '../../utils/checkout-utils';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';

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
      {checkouts.map((checkout) => {
        const checkoutId = checkout.id;
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
                <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: 12 }}>
                  {visibleColumns.status && (
                    <Box>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Estado
                      </Text>
                      <Badge tone={getStatusTone(checkout?.status ?? '')}>
                        {getStatusText(checkout?.status ?? '')}
                      </Badge>
                    </Box>
                  )}
                  {visibleColumns.total && (
                    <Box>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Total
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {formatCurrency(checkout.totalAmount ?? 0, checkout.currency ?? 'COP')}
                      </Text>
                    </Box>
                  )}
                  {visibleColumns.expiresAt && (
                    <Box>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Expira
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {formatExpiryDate(checkout.expiresAt)}
                      </Text>
                    </Box>
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
      })}
    </div>
  );
}
