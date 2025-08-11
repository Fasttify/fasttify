import { AIGenerateButton } from '@/app/store/components/product-management/products/components/form/AiGenerate';
import { useProductDescription } from '@/app/store/components/product-management/products/hooks/useProductDescription';
import { useToast } from '@/app/store/context/ToastContext';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { Banner, BlockStack, Button, ButtonGroup, Card, FormLayout, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { generateDescription, loading: isGeneratingDescription } = useProductDescription();
  const [previewDescription, setPreviewDescription] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleGenerateDescription = async () => {
    const productName = form.getValues('name');
    const category = form.getValues('category');

    if (!productName) {
      showToast('Por favor, ingrese un nombre de producto primero.', true);
      return;
    }

    try {
      const description = await generateDescription({
        productName,
        category: category || undefined,
      });
      setPreviewDescription(description);
    } catch (error) {
      console.error('Error al generar descripción:', error);
      showToast('No se pudo generar la descripción. Inténtelo de nuevo más tarde.', true);
    }
  };

  const acceptDescription = () => {
    if (previewDescription) {
      form.setValue('description', previewDescription, { shouldDirty: true, shouldTouch: true });
      showToast('La descripción generada ha sido aplicada al producto.');
      setPreviewDescription(null);
    }
  };

  const rejectDescription = () => {
    setPreviewDescription(null);
    showToast('La descripción generada ha sido descartada.');
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Información Básica
        </Text>
        <FormLayout>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Nombre del Producto"
                error={fieldState.error?.message}
                autoComplete="off"
                helpText="El nombre de su producto como aparecerá a los clientes."
              />
            )}
          />
          <BlockStack gap="200">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text as="h3" variant="headingSm">
                Descripción
              </Text>
              <AIGenerateButton
                onClick={handleGenerateDescription}
                isLoading={isGeneratingDescription}
                isDisabled={!!previewDescription}
              />
            </div>
            {previewDescription && (
              <Banner title="Vista previa de descripción generada" tone="info">
                <BlockStack gap="200">
                  <Text as="p">{previewDescription}</Text>
                  <ButtonGroup>
                    <Button onClick={handleGenerateDescription} loading={isGeneratingDescription}>
                      Regenerar
                    </Button>
                    <Button onClick={rejectDescription}>Descartar</Button>
                    <Button onClick={acceptDescription} variant="primary">
                      Aplicar
                    </Button>
                  </ButtonGroup>
                </BlockStack>
              </Banner>
            )}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  labelHidden
                  multiline={4}
                  error={fieldState.error?.message}
                  autoComplete="off"
                  helpText="Proporcione una descripción detallada de su producto."
                />
              )}
            />
          </BlockStack>

          <FormLayout.Group>
            <Controller
              name="creationDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Fecha de Creación"
                  type="date"
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(dateString) => {
                    if (!dateString) {
                      field.onChange(null);
                      return;
                    }
                    const date = new Date(dateString);
                    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                    field.onChange(new Date(date.getTime() + userTimezoneOffset));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={fieldState.error?.message}
                  autoComplete="off"
                  helpText="Cuando se creó este producto."
                />
              )}
            />

            <Controller
              name="lastModifiedDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Fecha de Última Modificación"
                  type="date"
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  disabled
                  error={fieldState.error?.message}
                  autoComplete="off"
                  helpText="Se actualiza automáticamente cuando se guarda el producto."
                />
              )}
            />
          </FormLayout.Group>
        </FormLayout>
      </BlockStack>
    </Card>
  );
}
