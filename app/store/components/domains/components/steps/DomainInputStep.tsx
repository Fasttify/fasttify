import { Banner, BlockStack, Button, InlineStack, TextField } from '@shopify/polaris';

interface DomainInputStepProps {
  domainName: string;
  onDomainChange: (value: string) => void;
  onNext: () => void;
  onCancel: () => void;
  validation: { isValid: boolean; error?: string };
  isLoading: boolean;
}

export function DomainInputStep({
  domainName,
  onDomainChange,
  onNext,
  onCancel,
  validation,
  isLoading,
}: DomainInputStepProps) {
  return (
    <BlockStack gap="400">
      <Banner title="Configuración Automatizada" tone="info">
        <p>
          Vamos a conectar tu dominio personalizado con tu tienda. No te preocupes, nosotros nos encargamos de todo lo
          técnico. Solo necesitarás seguir unos pasos sencillos para configurar tu dominio.
        </p>
      </Banner>

      <TextField
        label="Dominio personalizado"
        value={domainName}
        onChange={onDomainChange}
        placeholder="ej: mitienda.com"
        error={domainName && !validation.isValid ? validation.error : undefined}
        helpText="Ingresa tu dominio sin www"
        autoComplete="off"
      />

      <InlineStack align="end">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!domainName || !validation.isValid || isLoading}
          loading={isLoading}>
          Configurar Dominio
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
