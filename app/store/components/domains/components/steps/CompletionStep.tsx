import { LegacyStack, Text, Banner, Button, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';

interface CompletionStepProps {
  domain: string;
  method?: 'dns' | 'http' | 'cloudfront';
  onClose: () => void;
}

export function CompletionStep({ domain, method, onClose }: CompletionStepProps) {
  const getMethodText = () => {
    switch (method) {
      case 'dns':
        return 'validación DNS TXT';
      case 'http':
        return 'archivo HTTP';
      case 'cloudfront':
        return 'CloudFront Multi-Tenant';
      default:
        return 'configuración automática';
    }
  };

  return (
    <LegacyStack vertical spacing="loose" alignment="center">
      <Icon source={CheckCircleIcon} tone="success" />
      <Text variant="headingLg" as="h2" alignment="center">
        ¡Dominio preparado exitosamente!
      </Text>
      <Text as="p" tone="subdued" alignment="center">
        Tu dominio personalizado {domain} está configurado con SSL automático mediante {getMethodText()}.
      </Text>

      <Banner tone="warning">
        <p>
          <strong>Paso final:</strong> Configura tu DNS para que el dominio apunte a CloudFront. Encontrarás las
          instrucciones detalladas en la página de gestión de dominios.
        </p>
      </Banner>

      <Text as="p" tone="subdued" alignment="center">
        Una vez configurado el DNS, podrás acceder a tu tienda en: <strong>https://{domain}</strong>
      </Text>

      <LegacyStack distribution="trailing">
        <Button onClick={onClose} variant="primary">
          Finalizar y configurar DNS
        </Button>
      </LegacyStack>
    </LegacyStack>
  );
}
