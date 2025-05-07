import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader } from '@/components/ui/loader'
import Link from 'next/link'
import { useUserStoreData } from '@/app/(without-navbar)/first-steps/hooks/useUserStoreData'
import { useStoreNameValidator } from '@/app/(without-navbar)/first-steps/hooks/useStoreNameValidator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { storeProfileSchema, type StoreProfileFormValues } from '@/lib/schemas/store-profile-schema'
import {
  createStoreNameValidator,
  handleStoreNameChange,
  isSubmitButtonDisabled,
  handleStoreProfileSubmit,
  initializeStoreProfileForm,
  type StoreNameValidationState,
} from '@/app/store/components/domains/utils/storeProfileUtils'

import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

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
  const [originalStoreName, setOriginalStoreName] = useState('')
  const [nameChanged, setNameChanged] = useState(false)
  const [isStoreNameValid, setIsStoreNameValid] = useState(true)

  const form = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      storeName: initialData.storeName || '',
      storePhone: initialData.contactPhone || '',
      storeEmail: initialData.contactEmail || '',
    },
  })

  // Create validation state object for utility functions
  const validationState: StoreNameValidationState = {
    originalStoreName,
    nameChanged,
    isStoreNameValid,
    setNameChanged,
    setIsStoreNameValid,
  }

  // Initialize form when dialog opens
  useEffect(() => {
    initializeStoreProfileForm(
      open,
      initialData,
      form,
      setOriginalStoreName,
      setNameChanged,
      setIsStoreNameValid
    )
  }, [open, initialData, form])

  // Create debounced validator
  const debouncedCheckStoreName = useCallback(
    createStoreNameValidator(validationState, { checkStoreName, exists }),
    [validationState, checkStoreName, exists]
  )

  // Watch for store name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'storeName' && value.storeName !== undefined) {
        const currentName = value.storeName
        if (currentName !== originalStoreName) {
          setNameChanged(true)
          setIsStoreNameValid(false)
          debouncedCheckStoreName(currentName)
        } else {
          setNameChanged(false)
          setIsStoreNameValid(true)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, originalStoreName, debouncedCheckStoreName])

  // Update validation state when exists changes
  useEffect(() => {
    if (nameChanged) {
      setIsStoreNameValid(!exists)
    }
  }, [exists, nameChanged])

  // Handle store name input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStoreNameChange(e, validationState, debouncedCheckStoreName)
  }

  // Handle form submission
  const onSubmit = async (data: StoreProfileFormValues) => {
    await handleStoreProfileSubmit(
      data,
      storeId,
      validationState,
      updateUserStore,
      onProfileUpdated,
      () => onOpenChange(false)
    )
  }

  // Determine if submit button should be disabled
  const isSubmitDisabled = isSubmitButtonDisabled(
    isUpdating,
    form.formState.isSubmitting,
    nameChanged,
    isChecking,
    isStoreNameValid
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">Editar perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6">
          <p className="text-sm text-muted-foreground mb-6">
            Estos detalles podrían estar disponibles públicamente. No uses tu información personal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label htmlFor="storeName" className="text-sm font-medium">
                Nombre de la tienda
              </label>
              <Input
                id="storeName"
                {...form.register('storeName', { onChange: handleInputChange })}
                aria-invalid={form.formState.errors.storeName ? 'true' : 'false'}
              />
              {form.formState.errors.storeName && (
                <p className="text-xs text-red-500">{form.formState.errors.storeName.message}</p>
              )}
              {isChecking && nameChanged && (
                <p className="text-xs text-blue-500">Verificando disponibilidad...</p>
              )}
              {exists && nameChanged && (
                <p className="text-xs text-red-500">Este nombre de tienda ya está en uso</p>
              )}
              <p className="text-xs text-muted-foreground">Aparece en tu sitio web</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="storePhone" className="text-sm font-medium">
                Teléfono de la tienda
              </label>
              <Input
                type="tel"
                id="storePhone"
                {...form.register('storePhone')}
                aria-invalid={form.formState.errors.storePhone ? 'true' : 'false'}
              />
              {form.formState.errors.storePhone && (
                <p className="text-xs text-red-500">{form.formState.errors.storePhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label htmlFor="storeEmail" className="text-sm font-medium">
              Correo electrónico de la tienda
            </label>
            <Input
              type="email"
              id="storeEmail"
              {...form.register('storeEmail')}
              aria-invalid={form.formState.errors.storeEmail ? 'true' : 'false'}
            />
            {form.formState.errors.storeEmail && (
              <p className="text-xs text-red-500">{form.formState.errors.storeEmail.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Recibe mensajes sobre tu tienda. Para el correo electrónico del remitente, ve a{' '}
              <Link href="#" className="text-blue-600 hover:underline">
                configuración de notificaciones
              </Link>
              .
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors"
              disabled={isSubmitDisabled}
            >
              {isUpdating || form.formState.isSubmitting ? (
                <>
                  <Loader color="white" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
