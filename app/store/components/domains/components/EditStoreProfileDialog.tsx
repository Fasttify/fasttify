import { useEffect, useState, useCallback } from 'react'
import {
  Modal,
  Form,
  FormLayout,
  TextField,
  LegacyStack,
  Text,
  Spinner,
  Link,
} from '@shopify/polaris'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { useStoreNameValidator } from '@/app/(setup-layout)/first-steps/hooks/useStoreNameValidator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
  storeProfileSchema,
  type StoreProfileFormValues,
} from '@/lib/zod-schemas/store-profile-schema'
import {
  createStoreNameValidator,
  handleStoreProfileSubmit,
  type StoreNameValidationState,
} from '@/app/store/components/domains/utils/storeProfileUtils'
import { useToast } from '@/app/store/context/ToastContext'

interface EditStoreProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  initialData: {
    storeName?: string
    contactEmail?: string
    contactPhone?: string
  }
  onProfileUpdated?: () => void
}

export function EditStoreProfileDialog({
  open,
  onOpenChange,
  storeId,
  initialData,
  onProfileUpdated,
}: EditStoreProfileDialogProps) {
  const { updateUserStore, loading: isUpdating } = useUserStoreData()
  const { checkStoreName, isChecking, exists } = useStoreNameValidator()
  const { showToast } = useToast()
  const [originalStoreName, setOriginalStoreName] = useState('')
  const [nameChanged, setNameChanged] = useState(false)
  const [isStoreNameValid, setIsStoreNameValid] = useState(true)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      storeName: '',
      storePhone: '',
      storeEmail: '',
    },
  })

  const validationState: StoreNameValidationState = {
    originalStoreName,
    nameChanged,
    isStoreNameValid,
    setNameChanged,
    setIsStoreNameValid,
  }

  useEffect(() => {
    if (open) {
      const defaultValues = {
        storeName: initialData.storeName || '',
        storePhone: initialData.contactPhone || '',
        storeEmail: initialData.contactEmail || '',
      }
      reset(defaultValues)
      setOriginalStoreName(defaultValues.storeName)
      setNameChanged(false)
      setIsStoreNameValid(true)
    }
  }, [open, initialData, reset])

  const debouncedCheckStoreName = useCallback(
    createStoreNameValidator(validationState, { checkStoreName, exists }),
    [validationState, checkStoreName, exists]
  )

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'storeName' && value.storeName !== undefined) {
        if (value.storeName !== originalStoreName) {
          setNameChanged(true)
          setIsStoreNameValid(false)
          debouncedCheckStoreName(value.storeName)
        } else {
          setNameChanged(false)
          setIsStoreNameValid(true)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, originalStoreName, debouncedCheckStoreName])

  useEffect(() => {
    if (nameChanged) setIsStoreNameValid(!exists)
  }, [exists, nameChanged])

  const handleSuccess = () => {
    onOpenChange(false)
    showToast('Perfil de la tienda actualizado con éxito')
    if (onProfileUpdated) {
      onProfileUpdated()
    }
  }

  const onSubmit = async (data: StoreProfileFormValues) => {
    const success = await handleStoreProfileSubmit(data, storeId, validationState, updateUserStore)

    if (success) {
      handleSuccess()
    } else {
      showToast('Error al actualizar el perfil. Inténtalo de nuevo.', true)
    }
  }

  const isSubmitDisabled =
    isUpdating || isSubmitting || (nameChanged && (isChecking || !isStoreNameValid))

  const renderStoreNameHelpText = () => {
    if (isChecking && nameChanged) {
      return (
        <LegacyStack spacing="tight" alignment="center">
          <Spinner size="small" />
          <Text as="span">Verificando disponibilidad...</Text>
        </LegacyStack>
      )
    }
    if (exists && nameChanged) {
      return 'Este nombre de tienda ya está en uso'
    }
    return 'Aparece en tu sitio web'
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Editar perfil"
      primaryAction={{
        content: 'Guardar cambios',
        onAction: handleSubmit(onSubmit),
        loading: isUpdating || isSubmitting,
        disabled: isSubmitDisabled,
      }}
      secondaryActions={[{ content: 'Cancelar', onAction: () => onOpenChange(false) }]}
    >
      <Modal.Section>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Text as="p" tone="subdued">
            Estos detalles podrían estar disponibles públicamente. No uses tu información personal.
          </Text>
          <FormLayout>
            <Controller
              name="storeName"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Nombre de la tienda"
                  {...field}
                  error={errors.storeName?.message || (exists && nameChanged)}
                  helpText={renderStoreNameHelpText()}
                  autoComplete="off"
                />
              )}
            />
            <Controller
              name="storePhone"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Teléfono de la tienda"
                  type="tel"
                  {...field}
                  error={errors.storePhone?.message}
                  autoComplete="tel"
                />
              )}
            />
            <Controller
              name="storeEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Correo electrónico de la tienda"
                  type="email"
                  {...field}
                  error={errors.storeEmail?.message}
                  helpText={
                    <span>
                      Recibe mensajes sobre tu tienda. Para el correo electrónico del remitente, ve
                      a <Link url="#">configuración de notificaciones</Link>.
                    </span>
                  }
                  autoComplete="email"
                />
              )}
            />
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  )
}
