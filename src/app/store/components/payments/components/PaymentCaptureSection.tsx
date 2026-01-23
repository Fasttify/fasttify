'use client';

import { useState, useCallback } from 'react';
import { Card, ChoiceList, Text, Link, BlockStack, Box } from '@shopify/polaris';

export function PaymentCaptureSection() {
  const [selected, setSelected] = useState(['automatic']);

  const handleChange = useCallback((value: string[]) => setSelected(value), []);

  const choices = [
    {
      label: 'Captura automática al momento del pago',
      value: 'automatic',
      helpText: 'El pago se procesa de inmediato al realizar el pedido.',
    },
    {
      label: 'Captura automática cuando el pedido esté listo',
      value: 'when-ready',
      helpText: 'Se autoriza el pago al finalizar la compra y se captura al completar el pedido.',
    },
    {
      label: 'Captura manual',
      value: 'manual',
      helpText: 'Se autoriza el pago al finalizar la compra y debe capturarse manualmente.',
    },
  ];

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text variant="headingMd" as="h2">
              Método de Captura de Pago
            </Text>
            <Text as="p" tone="subdued">
              Decide cómo quieres procesar los pagos cuando un cliente realice una compra:{' '}
              <Link url="#">Más información</Link>.
            </Text>
          </BlockStack>
          <ChoiceList title="" choices={choices} selected={selected} onChange={handleChange} />
        </BlockStack>
      </Box>
    </Card>
  );
}
