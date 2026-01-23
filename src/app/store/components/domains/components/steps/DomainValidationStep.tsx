import { Badge, Banner, BlockStack, Box, Button, Card, Collapsible, InlineStack, List, Text } from '@shopify/polaris';
import { ClipboardIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

interface DomainValidationStepProps {
  domain: string;
  instructions: string;
  validationToken: string;
  onValidate: () => void;
  onSkip: () => void;
  isValidating: boolean;
  copyToClipboard: (text: string) => void;
}

export function DomainValidationStep({
  domain,
  validationToken,
  onValidate,
  onSkip,
  isValidating,
  copyToClipboard,
}: DomainValidationStepProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <BlockStack gap="400">
      <Banner title="Validación de Dominio Requerida" tone="warning">
        <p>
          Para usar tu dominio personalizado, necesitas demostrar que tienes control sobre él. Elige una de las opciones
          siguientes.
        </p>
      </Banner>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            Opciones de Validación
          </Text>

          <Banner tone="info">
            <p>Elige UNA de estas opciones para validar tu dominio:</p>
          </Banner>

          {/* Opción 1: DNS TXT */}
          <Box padding="400" background="bg-surface-secondary">
            <BlockStack gap="400">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge tone="info">OPCIÓN 1</Badge>
                <Text variant="headingSm" as="h4">
                  Registro DNS TXT
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Box minWidth="80px">
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Nombre:
                  </Text>
                </Box>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  _fasttify-validation.{domain}
                </Text>
                <Button
                  size="micro"
                  icon={ClipboardIcon}
                  onClick={() => copyToClipboard(`_fasttify-validation.${domain}`)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Box minWidth="80px">
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Valor:
                  </Text>
                </Box>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  {validationToken}
                </Text>
                <Button size="micro" icon={ClipboardIcon} onClick={() => copyToClipboard(validationToken)} />
              </div>

              <Text as="p" variant="bodySm" tone="subdued">
                TTL: 300 (5 minutos)
              </Text>
            </BlockStack>
          </Box>

          {/* Opción 2: Archivo HTTP */}
          <Box padding="400" background="bg-surface-secondary">
            <BlockStack gap="400">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge tone="info">OPCIÓN 2</Badge>
                <Text variant="headingSm" as="h4">
                  Archivo HTTP
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Box minWidth="80px">
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    URL:
                  </Text>
                </Box>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  http://{domain}/.well-known/fasttify-validation.txt
                </Text>
                <Button
                  size="micro"
                  icon={ClipboardIcon}
                  onClick={() => copyToClipboard(`http://${domain}/.well-known/fasttify-validation.txt`)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Box minWidth="80px">
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Contenido:
                  </Text>
                </Box>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  {validationToken}
                </Text>
                <Button size="micro" icon={ClipboardIcon} onClick={() => copyToClipboard(validationToken)} />
              </div>
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>

      <Button onClick={() => setShowDetails(!showDetails)} disclosure={showDetails ? 'up' : 'down'} fullWidth>
        Instrucciones detalladas por proveedor DNS
      </Button>

      <Collapsible id="dns-provider-details" open={showDetails}>
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h3">
              Configuración por proveedor DNS
            </Text>

            <List type="bullet">
              <List.Item>
                <strong>Cloudflare:</strong> DNS → Records → Add record → Type: TXT, Name: _fasttify-validation.{domain}
                , Content: {validationToken}
              </List.Item>
              <List.Item>
                <strong>GoDaddy:</strong> Domain Management → DNS → Add → Type: TXT, Host: _fasttify-validation, Value:{' '}
                {validationToken}
              </List.Item>
              <List.Item>
                <strong>Namecheap:</strong> Domain List → Manage → Advanced DNS → Add New Record → Type: TXT, Host:
                _fasttify-validation, Value: {validationToken}
              </List.Item>
              <List.Item>
                <strong>Route53:</strong> Hosted Zone → Create Record → Type: TXT, Name: _fasttify-validation.{domain},
                Value: {validationToken}
              </List.Item>
            </List>
          </BlockStack>
        </Card>
      </Collapsible>

      <Banner tone="warning">
        <p>
          <strong>El token expira en 24 horas.</strong> Una vez configurado, haz clic en &quot;Verificar Dominio&quot;.
        </p>
      </Banner>

      <InlineStack align="end" gap="200">
        <Button onClick={onSkip}>Configurar después</Button>
        <Button onClick={onValidate} loading={isValidating} variant="primary">
          Verificar Dominio
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
