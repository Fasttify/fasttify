import { useState, useEffect } from 'react'
import {
  Modal,
  TextField,
  Text,
  LegacyStack,
  Button,
  LegacyCard,
  Box,
  Badge,
  Divider,
  Icon,
  Collapsible,
  Banner,
} from '@shopify/polaris'
import { ChevronDownIcon, ChevronUpIcon, GlobeIcon, CheckCircleIcon } from '@shopify/polaris-icons'
import {
  useCustomDomain,
  type CustomDomainSetupResponse,
} from '@/app/store/hooks/api/useCustomDomain'
import { useToast } from '@/app/store/context/ToastContext'

interface CustomDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onDomainUpdated?: () => void
}

export function CustomDomainDialog({
  open,
  onOpenChange,
  storeId,
  onDomainUpdated,
}: CustomDomainDialogProps) {
  const [domainName, setDomainName] = useState('')
  const [step, setStep] = useState<'input' | 'verification'>('input')
  const [setupResponse, setSetupResponse] = useState<CustomDomainSetupResponse | null>(null)
  const [showDnsInstructions, setShowDnsInstructions] = useState(false)

  const { setupCustomDomain, validateDomain, loading, error } = useCustomDomain(storeId)
  const { showToast } = useToast()

  useEffect(() => {
    if (!open) {
      setDomainName('')
      setStep('input')
      setSetupResponse(null)
      setShowDnsInstructions(false)
    }
  }, [open])

  const validation = validateDomain(domainName)

  const handleSetupDomain = async () => {
    if (!validation.isValid) {
      showToast(validation.error || 'Dominio inválido', true)
      return
    }

    const result = await setupCustomDomain(domainName)

    if (result) {
      setSetupResponse(result)
      setStep('verification')
      setShowDnsInstructions(true)
      showToast('Dominio configurado. Configura el DNS para activarlo.', false)
    } else {
      showToast(error || 'Error al configurar el dominio', true)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    if (setupResponse && onDomainUpdated) {
      onDomainUpdated()
    }
  }

  const renderDnsInstructions = () => {
    if (!setupResponse) return null

    const { verificationInfo, domain } = setupResponse

    return (
      <LegacyStack vertical spacing="loose">
        <Banner tone="info" title="Configuración DNS requerida">
          <Text as="p">
            Para activar tu dominio personalizado, debes agregar estos registros DNS en tu proveedor
            (GoDaddy, Namecheap, etc.)
          </Text>
        </Banner>

        <LegacyCard>
          <LegacyCard.Section title="Paso 1: Registro de verificación (TXT)">
            <LegacyStack vertical spacing="tight">
              <Text as="p" tone="subdued">
                Agrega este registro TXT para verificar que eres propietario del dominio:
              </Text>

              <Box background="bg-surface-secondary" padding="300" borderRadius="200">
                <LegacyStack vertical spacing="extraTight">
                  <LegacyStack alignment="center">
                    <Text as="span" fontWeight="semibold">
                      Tipo:
                    </Text>
                    <Badge>TXT</Badge>
                  </LegacyStack>
                  <LegacyStack alignment="center">
                    <Text as="span" fontWeight="semibold">
                      Nombre:
                    </Text>
                    <Text as="span" breakWord>
                      {verificationInfo.name}
                    </Text>
                  </LegacyStack>
                  <LegacyStack alignment="center">
                    <Text as="span" fontWeight="semibold">
                      Valor:
                    </Text>
                    <Text as="span" breakWord>
                      {verificationInfo.value}
                    </Text>
                  </LegacyStack>
                </LegacyStack>
              </Box>
            </LegacyStack>
          </LegacyCard.Section>

          <LegacyCard.Section title="Paso 2: Registro de enrutamiento (CNAME)">
            <LegacyStack vertical spacing="tight">
              <Text as="p" tone="subdued">
                Agrega este registro CNAME para dirigir el tráfico a Fasttify:
              </Text>

              <Box background="bg-surface-secondary" padding="300" borderRadius="200">
                <LegacyStack vertical spacing="extraTight">
                  <LegacyStack alignment="center">
                    <Text as="span" fontWeight="semibold">
                      Tipo:
                    </Text>
                    <Badge>CNAME</Badge>
                  </LegacyStack>
                  <LegacyStack alignment="center">
                    <Text as="span" fontWeight="semibold">
                      Nombre:
                    </Text>
                    <Text as="span" breakWord>
                      {domain}
                    </Text>
                  </LegacyStack>
                  <LegacyStack alignment="center">
                    <Text as="span" fontWeight="semibold">
                      Valor:
                    </Text>
                    <Text as="span" breakWord>
                      proxy.fasttify.com
                    </Text>
                  </LegacyStack>
                </LegacyStack>
              </Box>
            </LegacyStack>
          </LegacyCard.Section>
        </LegacyCard>

        <LegacyCard>
          <LegacyCard.Section title="⏱️ ¿Cuánto tiempo toma?">
            <Text as="p">
              Una vez configurados los registros DNS, la verificación puede tomar entre
              <Text as="span" fontWeight="semibold">
                {' '}
                5 minutos y 24 horas
              </Text>{' '}
              en propagarse completamente. El certificado SSL se generará automáticamente.
            </Text>
          </LegacyCard.Section>
        </LegacyCard>

        <Banner>
          <Text as="p">
            💡{' '}
            <Text as="span" fontWeight="semibold">
              Tip:
            </Text>{' '}
            Puedes cerrar este diálogo y volver más tarde. Recibirás una notificación cuando tu
            dominio esté activo.
          </Text>
        </Banner>
      </LegacyStack>
    )
  }

  const renderInputStep = () => (
    <LegacyStack vertical spacing="loose">
      <Text as="p" tone="subdued">
        Conecta tu dominio personalizado a tu tienda. Asegúrate de tener acceso a la configuración
        DNS de tu dominio.
      </Text>

      <TextField
        label="Dominio personalizado"
        value={domainName}
        onChange={setDomainName}
        placeholder="mitienda.com"
        prefix={<Icon source={GlobeIcon} />}
        error={domainName && !validation.isValid ? validation.error : undefined}
        helpText={domainName && validation.isValid ? '✓ Formato válido' : 'Ejemplo: mitienda.com'}
        autoComplete="off"
      />

      <Box>
        <Button
          variant="plain"
          onClick={() => setShowDnsInstructions(!showDnsInstructions)}
          icon={showDnsInstructions ? ChevronUpIcon : ChevronDownIcon}
        >
          {showDnsInstructions ? 'Ocultar' : 'Ver'} instrucciones técnicas
        </Button>

        <Collapsible id="dns-instructions" open={showDnsInstructions}>
          <Box paddingBlockStart="300">
            <Text as="p" tone="subdued">
              Necesitarás agregar registros DNS en tu proveedor de dominios. El proceso incluye
              verificación de propiedad y configuración de enrutamiento.
            </Text>
          </Box>
        </Collapsible>
      </Box>
    </LegacyStack>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 'input' ? 'Conectar dominio personalizado' : 'Configurar DNS'}
      primaryAction={
        step === 'input'
          ? {
              content: 'Configurar dominio',
              onAction: handleSetupDomain,
              loading,
              disabled: !validation.isValid || loading,
            }
          : {
              content: 'Hecho',
              onAction: handleClose,
            }
      }
      secondaryActions={[
        {
          content: step === 'input' ? 'Cancelar' : 'Cerrar',
          onAction: handleClose,
        },
      ]}
      size="large"
    >
      <Modal.Section>
        {error && (
          <Box paddingBlockEnd="400">
            <Banner tone="critical">{error}</Banner>
          </Box>
        )}

        {step === 'input' ? renderInputStep() : renderDnsInstructions()}
      </Modal.Section>
    </Modal>
  )
}
