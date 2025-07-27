import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData';
import { useToast } from '@/app/store/context/ToastContext';
import { useDomainValidator } from '@/app/store/hooks/api/useDomainValidator';
import { BlockStack, InlineStack, Modal, Spinner, Text, TextField } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

interface ChangeDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  onDomainUpdated?: () => void;
}

export function ChangeDomainDialog({ open, onOpenChange, storeId, onDomainUpdated }: ChangeDomainDialogProps) {
  const [domainName, setDomainName] = useState('');
  const { checkDomain, isChecking, exists } = useDomainValidator();
  const [hasBeenValidated, setHasBeenValidated] = useState(false);
  const { updateUserStore, loading: isUpdating } = useUserStoreData();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) {
      setDomainName('');
      setHasBeenValidated(false);
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (domainName) {
        checkDomain(domainName);
        setHasBeenValidated(true);
      } else {
        setHasBeenValidated(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [domainName, checkDomain]);

  const handleSaveDomain = async () => {
    if (!storeId || !domainName.trim() || exists || isChecking || !hasBeenValidated) {
      return;
    }

    try {
      const fullDomain = `${domainName.trim()}.fasttify.com`;
      const result = await updateUserStore({ storeId, defaultDomain: fullDomain });

      if (result) {
        showToast('Dominio actualizado correctamente');
        onDomainUpdated?.();
        onOpenChange(false);
      } else {
        showToast('No se pudo actualizar el dominio', true);
      }
    } catch (error) {
      showToast('Ocurrió un error al actualizar el dominio', true);
    }
  };

  const formatDomain = (input: string) =>
    input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 63);

  const handleDomainChange = useCallback((value: string) => {
    setDomainName(formatDomain(value));
    setHasBeenValidated(false);
  }, []);

  const renderHelpText = () => {
    if (isChecking) {
      return (
        <InlineStack align="start" gap="050">
          <Spinner size="small" />
          <Text as="span" tone="subdued">
            Verificando disponibilidad...
          </Text>
        </InlineStack>
      );
    }
    if (domainName && hasBeenValidated) {
      return (
        <InlineStack align="end" gap="100">
          <Text as="span" tone={exists ? 'critical' : 'success'}>
            {exists ? 'Este dominio ya está en uso.' : '¡Dominio disponible!'}
          </Text>
        </InlineStack>
      );
    }
    return null;
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => onOpenChange(false)}
        title="Cambiar dominio de tu tienda"
        primaryAction={{
          content: 'Guardar dominio',
          onAction: handleSaveDomain,
          loading: isUpdating,
          disabled: !domainName.trim() || exists || isChecking || !hasBeenValidated,
        }}
        secondaryActions={[{ content: 'Cancelar', onAction: () => onOpenChange(false) }]}>
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p" tone="subdued">
              Puedes cambiar el dominio de tu tienda mas de una vez. Pero ten en cuenta que esta acción puede tener un
              impacto en el tráfico de tu tienda.
            </Text>
            <TextField
              label="Dominio"
              labelHidden
              value={domainName}
              onChange={handleDomainChange}
              suffix=".fasttify.com"
              placeholder="mi-tienda"
              autoComplete="off"
              helpText={renderHelpText()}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
