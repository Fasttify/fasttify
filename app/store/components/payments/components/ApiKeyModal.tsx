'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useField } from '@shopify/react-form';
import { Modal, Form, FormLayout, TextField, Banner, Text, LegacyStack, Badge, Box } from '@shopify/polaris';
import { PaymentGatewayType, PAYMENT_GATEWAYS, createApiKeySchema } from '@/lib/zod-schemas/api-keys';

type ApiKeyFormValues = {
  publicKey: string;
  privateKey: string;
};

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ApiKeyFormValues & { gateway: PaymentGatewayType }) => Promise<void | boolean>;
  gateway: PaymentGatewayType;
}

export function ApiKeyModal({ open, onOpenChange, onSubmit, gateway }: ApiKeyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gatewayConfig = PAYMENT_GATEWAYS[gateway];

  const { fields, submit, dirty, reset, submitErrors } = useForm({
    fields: {
      publicKey: useField(''),
      privateKey: useField(''),
    },
    onSubmit: async (values) => {
      const schema = createApiKeySchema(gateway);
      const validation = schema.safeParse(values);

      if (!validation.success) {
        const errors = validation.error.issues.map((err) => ({
          message: err.message,
          field: [err.path[0].toString()],
        }));
        return { status: 'fail', errors };
      }

      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit({ ...validation.data, gateway });
        }
        onOpenChange(false);
        return { status: 'success' };
      } catch (error) {
        console.error('Error al guardar las claves:', error);
        return {
          status: 'fail',
          errors: [{ message: 'Hubo un error al guardar las claves. Inténtalo de nuevo.' }],
        };
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const getFieldLabels = useCallback(() => {
    if (gateway === 'wompi') {
      return {
        publicKeyLabel: 'Llave Pública',
        publicKeyHelpText: 'Tu llave pública comienza con "pub_".',
        privateKeyLabel: 'Llave de Eventos',
        privateKeyHelpText: 'La llave para firmar eventos/webhooks.',
      };
    }
    return {
      publicKeyLabel: 'Public Key',
      publicKeyHelpText: `Tu Public Key comienza con "APP_USR-".`,
      privateKeyLabel: 'Access Token',
      privateKeyHelpText: `Tu Access Token comienza con "APP_USR-".`,
    };
  }, [gateway]);

  const fieldLabels = getFieldLabels();

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Configuración de ${gatewayConfig.name}`}
      primaryAction={{
        content: 'Guardar claves',
        onAction: submit,
        loading: isSubmitting,
        disabled: !dirty,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: () => onOpenChange(false),
          disabled: isSubmitting,
        },
      ]}>
      <Modal.Section>
        <Form onSubmit={submit}>
          <LegacyStack vertical spacing="loose">
            {submitErrors.length > 0 && (
              <Banner title="Error al guardar" tone="critical">
                {submitErrors.map(({ message }, index) => (
                  <p key={index}>{message}</p>
                ))}
              </Banner>
            )}
            <Banner title="Almacenamiento seguro de claves" tone="info">
              <p>
                Tus claves API se utilizan para autenticar solicitudes a la pasarela de pago y se almacenan de forma
                segura y encriptada.
              </p>
            </Banner>

            <Box
              borderWidth="025"
              borderColor="border"
              borderRadius="200"
              padding="400"
              background="bg-surface-secondary">
              <LegacyStack vertical spacing="baseTight">
                <LegacyStack distribution="equalSpacing" alignment="center">
                  <Text variant="headingMd" as="h3">
                    {gatewayConfig.name}
                  </Text>
                  <Badge tone="info">{`${gatewayConfig.transactionFee}% por transacción`}</Badge>
                </LegacyStack>
                <Text as="p" tone="subdued">
                  {gatewayConfig.description}
                </Text>
              </LegacyStack>
            </Box>

            <FormLayout>
              <TextField
                label={fieldLabels.publicKeyLabel}
                value={fields.publicKey.value}
                onChange={fields.publicKey.onChange}
                error={fields.publicKey.error}
                helpText={fieldLabels.publicKeyHelpText}
                autoComplete="off"
              />
              <TextField
                type="password"
                label={fieldLabels.privateKeyLabel}
                value={fields.privateKey.value}
                onChange={fields.privateKey.onChange}
                error={fields.privateKey.error}
                helpText={fieldLabels.privateKeyHelpText}
                autoComplete="off"
              />
            </FormLayout>
          </LegacyStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
}
