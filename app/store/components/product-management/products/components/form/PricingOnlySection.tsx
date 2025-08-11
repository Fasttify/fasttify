import {
  usePriceSuggestion,
  type PriceSuggestionResult,
} from '@/app/store/components/product-management/products/hooks/usePriceSuggestion';
import { useToast } from '@/app/store/context/ToastContext';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { BlockStack, Card, FormLayout, Text } from '@shopify/polaris';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { PriceField } from './PriceField';
import { PriceSuggestionPanel } from './PriceSuggestion';

interface PricingOnlySectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PricingOnlySection({ form }: PricingOnlySectionProps) {
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
      const rawResult = await generatePriceSuggestion({ productName, category: category || undefined });
      let parsedResult: any = rawResult;
      if (typeof rawResult === 'string') {
        try {
          parsedResult = JSON.parse(rawResult);
        } catch (e) {
          throw new Error('Formato de respuesta inválido');
        }
      }
      if (parsedResult) {
        setLocalPriceResult(parsedResult);
        showToast('Se ha generado una sugerencia de precio basada en el mercado.');
      }
    } catch (error) {
      showToast('No se pudo generar la sugerencia de precio. Inténtelo de nuevo más tarde.', true);
    }
  };

  const acceptPrice = () => {
    const resultToUse = localPriceResult || priceResult;
    if (resultToUse) {
      form.setValue('price', resultToUse.suggestedPrice || 0, { shouldDirty: true, shouldTouch: true });
      if (resultToUse.maxPrice && resultToUse.suggestedPrice && resultToUse.maxPrice > resultToUse.suggestedPrice) {
        form.setValue('compareAtPrice', resultToUse.maxPrice, { shouldDirty: true, shouldTouch: true });
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
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Precios
        </Text>
        <FormLayout>
          <PriceSuggestionPanel
            form={form}
            isGeneratingPrice={isGeneratingPrice}
            displayResult={displayResult}
            onGeneratePrice={handleGeneratePrice}
            onAcceptPrice={acceptPrice}
            onRejectPrice={rejectPrice}
          />

          <FormLayout.Group>
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <PriceField
                  label="Precio"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  helpText="El precio que pagarán los clientes."
                />
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
      </BlockStack>
    </Card>
  );
}
