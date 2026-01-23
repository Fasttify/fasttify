import { ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { BlockStack, Card, ChoiceList, Text } from '@shopify/polaris';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface PublicationSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PublicationSection({ form: _form }: PublicationSectionProps) {
  const [salesChannel, setSalesChannel] = useState(['online-store']);
  const [markets, setMarkets] = useState(['colombia-international']);

  return (
    <Card>
      <BlockStack gap="400">
        <div>
          <Text as="h3" variant="headingMd" alignment="start">
            Canales de ventas
          </Text>
          <ChoiceList
            title="Canales de ventas"
            titleHidden
            choices={[
              {
                label: 'Tienda online',
                value: 'online-store',
              },
              {
                label: 'Point of Sale',
                value: 'pos',
                helpText: 'Point of Sale no ha sido configurado.',
              },
            ]}
            selected={salesChannel}
            onChange={setSalesChannel}
          />
        </div>
        <div>
          <Text as="h3" variant="headingMd" alignment="start">
            Mercados
          </Text>
          <ChoiceList
            title="Mercados"
            titleHidden
            choices={[
              {
                label: 'Colombia y Internacional',
                value: 'colombia-international',
              },
            ]}
            selected={markets}
            onChange={setMarkets}
          />
        </div>
      </BlockStack>
    </Card>
  );
}
