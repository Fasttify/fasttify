import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { BlockStack, Card, Grid, Text, TextField } from '@shopify/polaris';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface InventoryOnlySectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function InventoryOnlySection({ form }: InventoryOnlySectionProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Inventario
        </Text>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <Controller
              name="sku"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="SKU (Código de Artículo)"
                  error={fieldState.error?.message}
                  autoComplete="off"
                  helpText="Un identificador único para su producto."
                />
              )}
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <Controller
              name="barcode"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Código de Barras (ISBN, UPC, GTIN, etc.)"
                  error={fieldState.error?.message}
                  autoComplete="off"
                  helpText="Ingrese un código de barras para su producto."
                />
              )}
            />
          </Grid.Cell>
        </Grid>
        <Controller
          name="quantity"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Cantidad"
              type="number"
              min={0}
              step={1}
              value={String(field.value ?? '')}
              error={fieldState.error?.message}
              autoComplete="off"
              helpText="El número de artículos en stock."
            />
          )}
        />
      </BlockStack>
    </Card>
  );
}
