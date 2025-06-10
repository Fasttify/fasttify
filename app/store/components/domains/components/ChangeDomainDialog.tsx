import { useEffect, useState, useCallback } from 'react'
import { Modal, TextField, Text, Spinner, LegacyStack, Icon, Toast } from '@shopify/polaris'
import { CheckCircleIcon, AlertTriangleIcon } from '@shopify/polaris-icons'
import { useDomainValidator } from '@/app/store/hooks/useDomainValidator'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'

interface ChangeDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onDomainUpdated?: () => void
}

export function ChangeDomainDialog({
  open,
  onOpenChange,
  storeId,
  onDomainUpdated,
}: ChangeDomainDialogProps) {
  const [domainName, setDomainName] = useState('')
  const { checkDomain, isChecking, exists } = useDomainValidator()
  const [hasBeenValidated, setHasBeenValidated] = useState(false)
  const { updateUserStore, loading: isUpdating } = useUserStoreData()

  const [toastActive, setToastActive] = useState(false)
  const [toastContent, setToastContent] = useState('')
  const [toastError, setToastError] = useState(false)

  const showToast = (content: string, isError = false) => {
    setToastContent(content)
    setToastError(isError)
    setToastActive(true)
  }

  useEffect(() => {
    if (!open) {
      setDomainName('')
      setHasBeenValidated(false)
    }
  }, [open])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (domainName) {
        checkDomain(domainName)
        setHasBeenValidated(true)
      } else {
        setHasBeenValidated(false)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [domainName, checkDomain])

  const handleSaveDomain = async () => {
    if (!storeId || !domainName.trim() || exists || isChecking || !hasBeenValidated) {
      return
    }

    try {
      const fullDomain = `${domainName.trim()}.fasttify.com`
      const result = await updateUserStore({ storeId, customDomain: fullDomain })

      if (result) {
        showToast('Dominio actualizado correctamente')
        onDomainUpdated?.()
        onOpenChange(false)
      } else {
        showToast('No se pudo actualizar el dominio', true)
      }
    } catch (error) {
      showToast('Ocurrió un error al actualizar el dominio', true)
    }
  }

  const formatDomain = (input: string) =>
    input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 63)

  const handleDomainChange = useCallback((value: string) => {
    setDomainName(formatDomain(value))
    setHasBeenValidated(false)
  }, [])

  const renderHelpText = () => {
    if (isChecking) {
      return (
        <LegacyStack alignment="center" spacing="extraTight">
          <Spinner size="small" />
          <Text as="span" tone="subdued">
            Verificando disponibilidad...
          </Text>
        </LegacyStack>
      )
    }
    if (domainName && hasBeenValidated) {
      return (
        <LegacyStack alignment="center" spacing="extraTight">
          <Icon
            source={exists ? AlertTriangleIcon : CheckCircleIcon}
            tone={exists ? 'critical' : 'success'}
          />
          <Text as="span" tone={exists ? 'critical' : 'success'}>
            {exists ? 'Este dominio ya está en uso.' : '¡Dominio disponible!'}
          </Text>
        </LegacyStack>
      )
    }
    return null
  }

  const toastMarkup = toastActive ? (
    <Toast content={toastContent} error={toastError} onDismiss={() => setToastActive(false)} />
  ) : null

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
        secondaryActions={[{ content: 'Cancelar', onAction: () => onOpenChange(false) }]}
      >
        <Modal.Section>
          <LegacyStack vertical spacing="loose">
            <Text as="p" tone="subdued">
              Solo puedes cambiar el dominio de tu tienda una vez. Este cambio es gratuito.
            </Text>
            <TextField
              label="Dominio"
              labelHidden
              value={domainName}
              onChange={handleDomainChange}
              suffix=".fasttify.com"
              placeholder="nombre-de-tu-tienda"
              autoComplete="off"
              helpText={renderHelpText()}
            />
          </LegacyStack>
        </Modal.Section>
      </Modal>
      {toastMarkup}
    </>
  )
}
