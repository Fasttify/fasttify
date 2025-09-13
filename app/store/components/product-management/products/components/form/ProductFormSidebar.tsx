'use client';

import { BlockStack, Card, Select, Text } from '@shopify/polaris';
import { Controller, UseFormReturn } from 'react-hook-form';
import { CategoryAutocomplete } from './CategoryAutocomplete';
import { CollectionAutocomplete } from './CollectionAutocomplete';
import { TagsSection } from './TagsSection';
import { PublicationSection } from './PublicationSection';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';

interface ProductFormSidebarProps {
  form: UseFormReturn<ProductFormValues>;
}

export function ProductFormSidebar({ form }: ProductFormSidebarProps) {
  const statusOptions = [
    { label: 'Borrador', value: 'draft' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Estado
          </Text>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select
                label="Estado del producto"
                labelHidden
                options={statusOptions}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Categoría
          </Text>
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <CategoryAutocomplete
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                helpText="Selecciona o busca una categoría para tu producto."
              />
            )}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Colección
          </Text>
          <Controller
            name="collectionId"
            control={form.control}
            render={({ field, fieldState }) => (
              <CollectionAutocomplete
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                helpText="Selecciona o busca una colección para asignar este producto."
              />
            )}
          />
        </BlockStack>
      </Card>

      <TagsSection form={form} />

      <PublicationSection form={form} />
    </BlockStack>
  );
}
