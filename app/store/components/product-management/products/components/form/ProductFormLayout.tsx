'use client';

import { BlockStack, Card, Text } from '@shopify/polaris';
import { Controller, UseFormReturn } from 'react-hook-form';
import { ImageUpload } from './ImageUpload';
import { PricingOnlySection } from './PricingOnlySection';
import { InventoryOnlySection } from './InventoryOnlySection';
import { AttributesForm } from './AttributesForm';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';

interface ProductFormLayoutProps {
  storeId: string;
  form: UseFormReturn<ProductFormValues>;
}

export function ProductFormLayout({ storeId, form }: ProductFormLayoutProps) {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Imágenes
          </Text>
          <Controller
            name="images"
            control={form.control}
            render={({ field }) => (
              <ImageUpload storeId={storeId} value={field.value ?? []} onChange={field.onChange} />
            )}
          />
        </BlockStack>
      </Card>

      <PricingOnlySection form={form} />

      <InventoryOnlySection form={form} />

      <Card>
        <Controller
          name="attributes"
          control={form.control}
          render={({ field }) => <AttributesForm value={field.value ?? []} onChange={field.onChange} />}
        />
      </Card>
    </BlockStack>
  );
}
