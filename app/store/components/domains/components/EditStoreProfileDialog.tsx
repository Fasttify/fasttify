import { useUserStoreData } from '@/app/(setup)/first-steps/hooks/useUserStoreData';
import { CurrencySelector } from '@/app/store/components/domains/components/CurrencySelector';
import { useCurrencyConfig } from '@/app/store/hooks/currency/useCurrencyConfig';
import { HelpTooltip } from '@/app/store/components/navigation-management/components/HelpTooltip';
import { useToast } from '@/app/store/context/ToastContext';
import { storeProfileSchema, type StoreProfileFormValues } from '@/lib/zod-schemas/store-profile-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlockStack, Card, Form, FormLayout, Link, Modal, Text, TextField } from '@shopify/polaris';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

interface EditStoreProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  initialData: {
    storeName?: string;
    contactEmail?: string;
    contactPhone?: string;
    storeAdress?: string;
    storeDescription?: string;
    storeCurrency?: string;
    currencyFormat?: string;
    currencyLocale?: string;
    currencyDecimalPlaces?: number;
  };
  onProfileUpdated?: () => void;
}

export function EditStoreProfileDialog({
  open,
  onOpenChange,
  storeId,
  initialData,
  onProfileUpdated,
}: EditStoreProfileDialogProps) {
  const { updateUserStore, loading: isUpdating } = useUserStoreData();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setValue,
  } = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      storeName: '',
      storePhone: '',
      storeEmail: '',
      storeAdress: '',
      storeDescription: '',
      storeCurrency: '',
      currencyFormat: '',
      currencyLocale: '',
      currencyDecimalPlaces: 0,
    },
  });

  // Observar cambios en la moneda seleccionada
  const selectedCurrency = useWatch({
    control,
    name: 'storeCurrency',
  });

  // Obtener configuración automática de la moneda
  const { config: currencyConfig } = useCurrencyConfig(selectedCurrency);

  // Actualizar configuración automáticamente cuando cambia la moneda
  useEffect(() => {
    if (selectedCurrency) {
      setValue('currencyFormat', currencyConfig.format, { shouldDirty: false });
      setValue('currencyLocale', currencyConfig.locale, { shouldDirty: false });
      setValue('currencyDecimalPlaces', currencyConfig.decimalPlaces, { shouldDirty: false });
    }
  }, [selectedCurrency, currencyConfig, setValue]);

  useEffect(() => {
    if (open) {
      const defaultValues = {
        storeName: initialData.storeName || '',
        storePhone: initialData.contactPhone || '',
        storeEmail: initialData.contactEmail || '',
        storeAdress: initialData.storeAdress || '',
        storeDescription: initialData.storeDescription || '',
        storeCurrency: initialData.storeCurrency || '',
        currencyFormat: initialData.currencyFormat || '',
        currencyLocale: initialData.currencyLocale || '',
        currencyDecimalPlaces: initialData.currencyDecimalPlaces || 0,
      };
      reset(defaultValues);
    }
  }, [open, initialData, reset]);

  const handleSuccess = () => {
    onOpenChange(false);
    showToast('Perfil de la tienda actualizado con éxito');
    if (onProfileUpdated) {
      onProfileUpdated();
    }
  };

  const onSubmit = async (data: StoreProfileFormValues) => {
    if (!storeId) {
      showToast('Error: No se encontró el ID de la tienda.', true);
      return;
    }

    try {
      const result = await updateUserStore({
        storeId: storeId,
        storeName: data.storeName,
        contactEmail: data.storeEmail,
        contactPhone: data.storePhone,
        storeAdress: data.storeAdress,
        storeDescription: data.storeDescription,
        storeCurrency: data.storeCurrency,
        currencyFormat: currencyConfig.format,
        currencyLocale: currencyConfig.locale,
        currencyDecimalPlaces: currencyConfig.decimalPlaces,
      });

      if (result) {
        handleSuccess();
      } else {
        showToast('Error al actualizar el perfil. Inténtalo de nuevo.', true);
      }
    } catch (error) {
      console.error('Error updating store information:', error);
      showToast('Error al actualizar el perfil. Inténtalo de nuevo.', true);
    }
  };

  const isSubmitDisabled = !isDirty || isUpdating || isSubmitting;

  // Función para mostrar vista previa del formato
  const renderCurrencyPreview = () => {
    if (!selectedCurrency) return null;

    const exampleAmount = 1234.56;
    const formattedAmount = new Intl.NumberFormat(currencyConfig.locale, {
      minimumFractionDigits: currencyConfig.decimalPlaces,
      maximumFractionDigits: currencyConfig.decimalPlaces,
    }).format(exampleAmount);

    const preview = currencyConfig.format.replace('{{amount}}', formattedAmount);

    return (
      <Card>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Vista previa del formato
          </Text>
          <Text as="p" tone="subdued">
            Ejemplo: {preview}
          </Text>
          <Text as="p" tone="subdued" variant="bodySm">
            Locale: {currencyConfig.locale} | Decimales: {currencyConfig.decimalPlaces}
          </Text>
        </BlockStack>
      </Card>
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Editar perfil{' '}
          <HelpTooltip content="Estos datos ayudaran a mejorar el SEO de tu tienda. No uses tu información personal." />
        </div>
      }
      primaryAction={{
        content: 'Guardar cambios',
        onAction: handleSubmit(onSubmit),
        loading: isUpdating || isSubmitting,
        disabled: isSubmitDisabled,
      }}
      secondaryActions={[{ content: 'Cancelar', onAction: () => onOpenChange(false) }]}>
      <Modal.Section>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Text as="p" tone="subdued">
            Estos detalles podrían estar disponibles públicamente. No uses tu información personal.
          </Text>
          <FormLayout>
            <Controller
              name="storeName"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Nombre de la tienda"
                  {...field}
                  error={errors.storeName?.message}
                  autoComplete="off"
                />
              )}
            />
            <Controller
              name="storePhone"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Teléfono de la tienda"
                  type="tel"
                  {...field}
                  error={errors.storePhone?.message}
                  autoComplete="tel"
                />
              )}
            />
            <Controller
              name="storeAdress"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Dirección de la tienda"
                  type="text"
                  {...field}
                  error={errors.storeAdress?.message}
                  autoComplete="address-line1"
                />
              )}
            />
            <Controller
              name="storeEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Correo electrónico de la tienda"
                  type="email"
                  {...field}
                  error={errors.storeEmail?.message}
                  helpText={
                    <span>
                      Recibe mensajes sobre tu tienda. Para el correo electrónico del remitente, ve a{' '}
                      <Link url="#">configuración de notificaciones</Link>.
                    </span>
                  }
                  autoComplete="email"
                />
              )}
            />
            <Controller
              name="storeCurrency"
              control={control}
              render={({ field }) => (
                <CurrencySelector
                  value={field.value}
                  onChange={field.onChange}
                  helpText="Selecciona la moneda principal para tu tienda. El formato se configurará automáticamente."
                  error={errors.storeCurrency?.message}
                  showSymbol={true}
                  showBadge={true}
                />
              )}
            />
            {renderCurrencyPreview()}
            <Controller
              name="storeDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Descripción de la tienda"
                  type="text"
                  {...field}
                  error={errors.storeDescription?.message}
                  autoComplete="off"
                  multiline={6}
                />
              )}
            />
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}
