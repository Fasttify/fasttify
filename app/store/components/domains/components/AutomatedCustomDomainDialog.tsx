import { useState, useEffect } from 'react'
import { Modal, LegacyStack } from '@shopify/polaris'
import { useCustomDomain } from '@/app/store/hooks/api/useCustomDomain'
import { useDomainValidation } from '@/app/store/hooks/api/useDomainValidation'
import { useToast } from '@/app/store/context/ToastContext'

// Importar los componentes modulares
import { DomainInputStep } from '@/app/store/components/domains/components/steps/DomainInputStep'
import { DomainValidationStep } from '@/app/store/components/domains/components/steps/DomainValidationStep'
import { ACMValidationStep } from '@/app/store/components/domains/components/steps/ACMValidationStep'
import { LoadingStep } from '@/app/store/components/domains/components/steps/LoadingStep'
import { CompletionStep } from '@/app/store/components/domains/components/steps/CompletionStep'
import { StepProgress } from '@/app/store/components/domains/components/shared/StepProgress'

interface AutomatedCustomDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onDomainUpdated?: () => void
}

type SetupStep = 'input' | 'validation' | 'acm-validation' | 'cloudfront' | 'complete'

export function AutomatedCustomDomainDialog({
  open,
  onOpenChange,
  storeId,
  onDomainUpdated,
}: AutomatedCustomDomainDialogProps) {
  const [domainName, setDomainName] = useState('')
  const [currentStep, setCurrentStep] = useState<SetupStep>('input')
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)

  const { setupCustomDomain, validateDomain } = useCustomDomain(storeId)
  const { showToast } = useToast()

  // Hook de validación de dominios
  const {
    generateValidationToken,
    verifyDomainValidation,
    verifyACMCertificate,
    resetValidation,
    isLoading: isValidationLoading,
    validationToken,
    instructions,
    validationMethod,
    certificateArn,
    acmValidationRecords,
    isCertificateReady,
  } = useDomainValidation()

  useEffect(() => {
    if (!open) {
      resetDialog()
    }
  }, [open])

  const resetDialog = () => {
    setDomainName('')
    setCurrentStep('input')
    resetValidation()
  }

  const validation = validateDomain(domainName)

  // Manejo del primer paso: solicitar token de validación
  const handleRequestValidation = async () => {
    if (!validation.isValid) {
      showToast(validation.error ?? 'Dominio inválido', true)
      return
    }

    const result = await generateValidationToken(domainName)
    if (result.success) {
      setCurrentStep('validation')
      showToast('Token de validación generado. Configura tu DNS o archivo HTTP.', false)
    } else {
      showToast(result.error ?? 'Error generando token de validación', true)
    }
  }

  // Manejo de la validación
  const handleValidateDomain = async () => {
    if (!validationToken) return

    const result = await verifyDomainValidation(domainName, validationToken)
    if (result.success) {
      showToast('¡Dominio validado! Verificando certificado SSL...', false)

      // Si necesita validación ACM, ir al paso de ACM
      if (result.data?.needsACMValidation) {
        setCurrentStep('acm-validation')
      } else {
        // Si el certificado ya está listo, crear CloudFront directamente
        setCurrentStep('cloudfront')
        handleCreateCloudFront()
      }
    } else {
      showToast(result.error ?? 'Error verificando dominio', true)
    }
  }

  // Manejo de la validación ACM
  const handleValidateACM = async () => {
    if (!certificateArn) return

    const result = await verifyACMCertificate(certificateArn)
    if (result.success && result.data?.isReady) {
      setCurrentStep('cloudfront')
      showToast('¡Certificado SSL validado! Conectando con tu tienda...', false)
      handleCreateCloudFront()
    } else {
      showToast(
        result.error ?? 'El certificado SSL aún no está listo. Inténtalo de nuevo en unos minutos.',
        true
      )
    }
  }

  // Crear tenant de CloudFront (separado para reutilizar)
  const handleCreateCloudFront = async () => {
    try {
      const cloudFrontResult = await setupCustomDomain(domainName)
      if (cloudFrontResult && cloudFrontResult.success) {
        setCurrentStep('complete')
        showToast('¡Dominio personalizado configurado exitosamente!', false)
        if (onDomainUpdated) {
          onDomainUpdated()
        }
      } else {
        showToast('Error conectando con tu tienda', true)
        setCurrentStep('validation')
      }
    } catch (err) {
      showToast('Error inesperado al conectar con tu tienda', true)
      setCurrentStep('validation')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Copiado al portapapeles')
  }

  const handleClose = () => {
    // Si está en proceso (no en input o complete), mostrar confirmación
    if (currentStep !== 'input' && currentStep !== 'complete') {
      setShowCloseConfirmation(true)
      return
    }

    // Cerrar directamente si está en input o complete
    onOpenChange(false)
    if (currentStep === 'complete' && onDomainUpdated) {
      onDomainUpdated()
    }
  }

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false)
    onOpenChange(false)
    resetDialog()
  }

  const handleCancelClose = () => {
    setShowCloseConfirmation(false)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'input':
        return (
          <DomainInputStep
            domainName={domainName}
            onDomainChange={setDomainName}
            onNext={handleRequestValidation}
            onCancel={handleClose}
            validation={validation}
            isLoading={isValidationLoading}
          />
        )
      case 'validation':
        return (
          <DomainValidationStep
            domain={domainName}
            instructions={instructions ?? ''}
            validationToken={validationToken ?? ''}
            onValidate={handleValidateDomain}
            onSkip={handleClose}
            isValidating={isValidationLoading}
            copyToClipboard={copyToClipboard}
          />
        )
      case 'acm-validation':
        return (
          <ACMValidationStep
            domain={domainName}
            certificateArn={certificateArn ?? ''}
            acmValidationRecords={acmValidationRecords}
            onContinue={() => {
              setCurrentStep('cloudfront')
              handleValidateACM()
              handleCreateCloudFront()
            }}
            onBack={() => setCurrentStep('validation')}
            onVerifyACM={async certArn => {
              const result = await verifyACMCertificate(certArn)
              return result
            }}
            isLoading={isValidationLoading}
            isCertificateReady={isCertificateReady}
            copyToClipboard={copyToClipboard}
          />
        )
      case 'cloudfront':
        return (
          <LoadingStep
            title="Conectando con tu tienda"
            description="Esto puede tomar unos minutos..."
          />
        )
      case 'complete':
        return (
          <CompletionStep
            domain={domainName}
            method={validationMethod ?? 'cloudfront'}
            onClose={handleClose}
          />
        )
      default:
        return (
          <DomainInputStep
            domainName={domainName}
            onDomainChange={setDomainName}
            onNext={handleRequestValidation}
            onCancel={handleClose}
            validation={validation}
            isLoading={isValidationLoading}
          />
        )
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="Configurar Dominio Personalizado"
        size="large"
      >
        <Modal.Section>
          <LegacyStack vertical spacing="loose">
            {currentStep !== 'input' && currentStep !== 'complete' && (
              <StepProgress currentStep={currentStep} />
            )}
            {renderCurrentStep()}
          </LegacyStack>
        </Modal.Section>
      </Modal>

      {/* Modal de confirmación para cerrar */}
      <Modal
        open={showCloseConfirmation}
        onClose={handleCancelClose}
        title="¿Estás seguro que deseas salir?"
        primaryAction={{
          content: 'Salir',
          destructive: true,
          onAction: handleConfirmClose,
        }}
        secondaryActions={[
          {
            content: 'Continuar',
            onAction: handleCancelClose,
          },
        ]}
      >
        <Modal.Section>
          <p>
            Si sales ahora, perderás todo el progreso de configuración del dominio personalizado.
            Tendrás que empezar el proceso desde el inicio.
          </p>
        </Modal.Section>
      </Modal>
    </>
  )
}
