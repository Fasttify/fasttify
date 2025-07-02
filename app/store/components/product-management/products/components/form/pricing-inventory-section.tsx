import type { UseFormReturn } from 'react-hook-form';
import { FormLayout, TextField, BlockStack, Divider, Grid, Text } from '@shopify/polaris';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { useState } from 'react';
import { useToast } from '@/app/store/context/ToastContext';
import {
  usePriceSuggestion,
  type PriceSuggestionResult,
} from '@/app/store/components/product-management/products/hooks/usePriceSuggestion';
import { PriceSuggestionPanel } from '@/app/store/components/product-management/products/components/form/price-suggestion-panel';
import { Controller } from 'react-hook-form';
import { PriceField } from './PriceField';

interface PricingInventorySectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PricingInventorySection({ form }: PricingInventorySectionProps) {
  const {
    generatePriceSuggestion,
    loading: isGeneratingPrice,
    result: priceResult,
    reset: resetPriceSuggestion,
  } = usePriceSuggestion();

  const [localPriceResult, setLocalPriceResult] = useState<PriceSuggestionResult | null>(null);
  const { showToast } = useToast();

  const displayResult = localPriceResult || priceResult;

  const handleGeneratePrice = async () => {
    const productName = form.getValues('name');
    const category = form.getValues('category');

    if (!productName) {
      showToast('Por favor, ingrese un nombre de producto primero.', true);
      return;
    }

    try {
      const rawResult = await generatePriceSuggestion({
        productName,
        category: category || undefined,
      });

      let parsedResult;
      if (typeof rawResult === 'string') {
        try {
          parsedResult = JSON.parse(rawResult);

          setLocalPriceResult(parsedResult);
        } catch (parseError) {
          console.error('Error parsing result:', parseError);
          throw new Error('The response format is invalid');
        }
      } else {
        parsedResult = rawResult;

        if (parsedResult) {
          setLocalPriceResult(parsedResult);
        }
      }

      if (parsedResult) {
        showToast('Se ha generado una sugerencia de precio basada en el mercado.');

        // Si tenemos un costo por artículo, podemos calcular el margen
        const costPerItem = form.getValues('costPerItem');
        if (costPerItem && parsedResult.suggestedPrice > 0) {
          const margin = ((parsedResult.suggestedPrice - costPerItem) / parsedResult.suggestedPrice) * 100;
          if (margin < 10) {
            showToast(`El margen calculado es de ${margin.toFixed(1)}%, que es menor al 10% recomendado.`);
          }
        }
      } else {
        console.warn('No valid result was received from the API');
      }
    } catch (error) {
      console.error('Error generating price suggestion:', error);
      showToast('No se pudo generar la sugerencia de precio. Inténtelo de nuevo más tarde.', true);
    }
  };

  const acceptPrice = () => {
    const resultToUse = localPriceResult || priceResult;

    if (resultToUse) {
      form.setValue('price', resultToUse.suggestedPrice || 0, {
        shouldDirty: true,
        shouldTouch: true,
      });

      if (resultToUse.maxPrice && resultToUse.suggestedPrice && resultToUse.maxPrice > resultToUse.suggestedPrice) {
        form.setValue('compareAtPrice', resultToUse.maxPrice, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      showToast('El precio sugerido ha sido aplicado al producto.');
      resetPriceSuggestion();
      setLocalPriceResult(null);
    }
  };

  const rejectPrice = () => {
    resetPriceSuggestion();
    setLocalPriceResult(null);
    showToast('La sugerencia de precio ha sido descartada.');
  };

  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">
        Precios
      </Text>
      <FormLayout>
        <FormLayout.Group>
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <BlockStack gap="150">
                <PriceSuggestionPanel
                  form={form}
                  isGeneratingPrice={isGeneratingPrice}
                  displayResult={displayResult}
                  onGeneratePrice={handleGeneratePrice}
                  onAcceptPrice={acceptPrice}
                  onRejectPrice={rejectPrice}
                />
                <PriceField
                  label="Precio"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  helpText="El precio que pagarán los clientes."
                />
              </BlockStack>
            )}
          />
          <Controller
            name="compareAtPrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <PriceField
                label="Precio de Comparación"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                helpText="Precio original antes del descuento (opcional)."
              />
            )}
          />
        </FormLayout.Group>
      </FormLayout>
      <Controller
        name="costPerItem"
        control={form.control}
        render={({ field, fieldState }) => (
          <PriceField
            label="Costo por Artículo"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            helpText="Su costo para comprar o producir este artículo (opcional)."
          />
        )}
      />
      <Divider />
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
  );
}
