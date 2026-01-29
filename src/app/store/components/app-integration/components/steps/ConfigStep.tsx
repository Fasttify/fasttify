import { ChoiceList, TextField, Banner, Spinner, BlockStack, Text, Button, InlineStack } from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';
import { Option, Status } from '@/app/store/components/app-integration/constants/connectModal';

interface ConfigStepProps {
  option: Option;
  onOptionChange: (option: Option) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  status: Status;
  errorMessage: string;
}

export function ConfigStep({ option, onOptionChange, apiKey, onApiKeyChange, status, errorMessage }: ConfigStepProps) {
  const choices = [
    {
      label: 'Ya tengo cuenta en Master Shop',
      value: 'existing',
      helpText: 'Conecta con tu cuenta existente usando una API Key.',
      renderChildren: (isSelected: boolean) =>
        isSelected && (
          <div style={{ marginTop: '1rem' }}>
            <TextField
              label="API Key de Master Shop"
              value={apiKey}
              onChange={onApiKeyChange}
              placeholder="Ingresa tu API Key"
              helpText="Puedes encontrar tu API Key en la configuración de tu cuenta de Master Shop."
              disabled={status === 'loading'}
              autoComplete="off"
            />
          </div>
        ),
    },
    {
      label: 'Crear cuenta en Master Shop',
      value: 'new',
      helpText: 'Serás redirigido al sitio web de Master Shop para crear una cuenta.',
      renderChildren: (isSelected: boolean) =>
        isSelected && (
          <div style={{ marginTop: '1rem' }}>
            <Button icon={ExternalIcon} url="https://mastershop.com" target="_blank">
              Ir a Master Shop
            </Button>
          </div>
        ),
    },
  ];

  return (
    <BlockStack gap="500">
      <ChoiceList
        title="Opciones de Conexión"
        titleHidden
        choices={choices}
        selected={option ? [option] : []}
        onChange={([value]) => onOptionChange(value as Option)}
      />

      {status === 'loading' && (
        <InlineStack gap="200" align="center">
          <Spinner size="small" />
          <Text as="span" tone="subdued">
            Verificando conexión...
          </Text>
        </InlineStack>
      )}

      {status === 'error' && errorMessage && (
        <Banner title="Error" tone="critical">
          <p>{errorMessage}</p>
        </Banner>
      )}
    </BlockStack>
  );
}
