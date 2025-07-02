'use client';

import { useState, useCallback } from 'react';
import { LegacyCard, Text, Button, LegacyStack, Banner, Box, Badge } from '@shopify/polaris';
import { ClipboardIcon, RefreshIcon } from '@shopify/polaris-icons';

interface ACMValidationStepProps {
  domain: string;
  certificateArn: string;
  acmValidationRecords: Array<{
    name: string;
    value: string;
    type: string;
  }>;
  onContinue: () => void;
  onBack: () => void;
  onVerifyACM: (certificateArn: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  isLoading: boolean;
  isCertificateReady: boolean;
  copyToClipboard: (text: string) => void;
}

export function ACMValidationStep({
  domain,
  certificateArn,
  acmValidationRecords,
  onContinue,
  onBack,
  onVerifyACM,
  isLoading,
  isCertificateReady,
  copyToClipboard,
}: ACMValidationStepProps) {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const handleVerifyACM = useCallback(async () => {
    const result = await onVerifyACM(certificateArn);

    if (result.success && result.data?.isReady) {
      setVerificationStatus('success');
      setTimeout(() => onContinue(), 1500);
    } else {
      setVerificationStatus('error');
    }
  }, [certificateArn, onVerifyACM, onContinue]);

  return (
    <LegacyStack vertical spacing="extraLoose">
      {/* Header */}
      <LegacyStack vertical spacing="tight" alignment="center">
        <Text variant="headingLg" as="h2">
          Validación de Certificado SSL
        </Text>
        <Text variant="bodyMd" as="p" tone="subdued">
          Configura los registros DNS para validar tu certificado SSL
        </Text>
      </LegacyStack>

      {/* Alert Banner */}
      <Banner title="Registros DNS adicionales requeridos">
        <Text variant="bodyMd" as="p">
          Para completar la validación SSL de{' '}
          <Text variant="bodyMd" as="span" fontWeight="semibold">
            {domain}
          </Text>
          , configura los siguientes registros DNS en tu proveedor:
        </Text>
      </Banner>

      {/* Validation Records */}
      <LegacyStack vertical spacing="loose">
        {acmValidationRecords.map((record, index) => (
          <LegacyCard sectioned key={index}>
            <LegacyStack vertical spacing="loose">
              <Text variant="bodyMd" as="h3" fontWeight="semibold">
                Registro {index + 1}
              </Text>

              <LegacyStack vertical spacing="tight">
                {/* Tipo */}
                <LegacyStack vertical spacing="extraTight">
                  <Text variant="bodySm" as="p" fontWeight="medium" tone="subdued">
                    TIPO
                  </Text>
                  <Badge>{record.type}</Badge>
                </LegacyStack>

                {/* Nombre */}
                <LegacyStack vertical spacing="extraTight">
                  <Text variant="bodySm" as="p" fontWeight="medium" tone="subdued">
                    NOMBRE
                  </Text>
                  <LegacyStack distribution="fill" spacing="tight">
                    <Box>
                      <Text variant="bodySm" as="span">
                        {record.name}
                      </Text>
                    </Box>
                    <Button
                      size="slim"
                      icon={ClipboardIcon}
                      onClick={() => copyToClipboard(record.name)}
                      accessibilityLabel="Copiar nombre del registro"
                    />
                  </LegacyStack>
                </LegacyStack>

                {/* Valor */}
                <LegacyStack vertical spacing="extraTight">
                  <Text variant="bodySm" as="p" fontWeight="medium" tone="subdued">
                    VALOR
                  </Text>
                  <LegacyStack distribution="fill" spacing="tight">
                    <Box padding="200">
                      <Text variant="bodySm" as="span">
                        {record.value}
                      </Text>
                    </Box>
                    <Button
                      size="slim"
                      icon={ClipboardIcon}
                      onClick={() => copyToClipboard(record.value)}
                      accessibilityLabel="Copiar valor del registro"
                    />
                  </LegacyStack>
                </LegacyStack>

                {/* TTL */}
                <LegacyStack vertical spacing="extraTight">
                  <Text variant="bodySm" as="p" fontWeight="medium" tone="subdued">
                    TTL
                  </Text>
                  <Box padding="200">
                    <Text variant="bodySm" as="span">
                      300 (5 minutos)
                    </Text>
                  </Box>
                </LegacyStack>
              </LegacyStack>
            </LegacyStack>
          </LegacyCard>
        ))}
      </LegacyStack>

      {/* Information Banner */}
      <Banner title="Información importante">
        <LegacyStack vertical spacing="extraTight">
          <Text variant="bodyMd" as="p">
            Estos son registros ADICIONALES a los de validación de control de dominio
          </Text>
          <Text variant="bodyMd" as="p">
            La validación ACM puede tardar entre 5-30 minutos
          </Text>
          <Text variant="bodyMd" as="p">
            El certificado se validará automáticamente una vez que AWS detecte los registros
          </Text>
        </LegacyStack>
      </Banner>

      {/* Action Buttons */}
      <LegacyStack distribution="trailing" spacing="tight">
        <Button onClick={onBack}>Anterior</Button>

        <Button onClick={handleVerifyACM} loading={isLoading} icon={RefreshIcon}>
          {isLoading ? 'Verificando...' : 'Verificar SSL'}
        </Button>

        <Button
          variant="primary"
          onClick={onContinue}
          disabled={!isCertificateReady && verificationStatus !== 'success'}>
          Continuar
        </Button>
      </LegacyStack>
    </LegacyStack>
  );
}
