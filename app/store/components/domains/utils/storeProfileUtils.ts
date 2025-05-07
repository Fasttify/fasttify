import { debounce } from 'lodash'
import { toast } from 'sonner'
import { Dispatch, SetStateAction } from 'react'
import { StoreProfileFormValues } from '@/lib/schemas/store-profile-schema'
import { UseFormReturn } from 'react-hook-form'

// Types for validation state
export interface StoreNameValidationState {
  originalStoreName: string
  nameChanged: boolean
  isStoreNameValid: boolean
  setNameChanged: Dispatch<SetStateAction<boolean>>
  setIsStoreNameValid: Dispatch<SetStateAction<boolean>>
}

// Types for store name validation
export interface StoreNameValidatorProps {
  checkStoreName: (name: string) => Promise<void>
  exists: boolean
}

/**
 * Creates a debounced function to validate store names
 */
export const createStoreNameValidator = (
  validationState: StoreNameValidationState,
  validatorProps: StoreNameValidatorProps
) => {
  const { originalStoreName, setNameChanged, setIsStoreNameValid } = validationState
  const { checkStoreName, exists } = validatorProps

  return debounce(async (name: string) => {
    if (name !== originalStoreName) {
      setNameChanged(true)

      if (name.length >= 3) {
        await checkStoreName(name)

        setIsStoreNameValid(!exists)
      } else {
        setIsStoreNameValid(false)
      }
    } else if (name === originalStoreName) {
      setNameChanged(false)
      setIsStoreNameValid(true)
    }
  }, 1000)
}

/**
 * Handles immediate validation on store name change
 */
export const handleStoreNameChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  validationState: StoreNameValidationState,
  debouncedCheckStoreName: (name: string) => void
) => {
  const { originalStoreName, setNameChanged, setIsStoreNameValid } = validationState
  const value = e.target.value

  if (value !== originalStoreName) {
    setNameChanged(true)
    setIsStoreNameValid(false)
  } else {
    setNameChanged(false)
    setIsStoreNameValid(true)
  }

  debouncedCheckStoreName(value)
}

/**
 * Determines if the submit button should be disabled
 */
export const isSubmitButtonDisabled = (
  isUpdating: boolean,
  isSubmitting: boolean,
  nameChanged: boolean,
  isChecking: boolean,
  isStoreNameValid: boolean
) => {
  return isUpdating || isSubmitting || (nameChanged && (isChecking || !isStoreNameValid))
}

/**
 * Handles form submission for store profile updates
 */
export const handleStoreProfileSubmit = async (
  data: StoreProfileFormValues,
  storeId: string,
  validationState: StoreNameValidationState,
  updateUserStore: (data: any) => Promise<any>,
  onSuccess?: () => void,
  onClose?: () => void
) => {
  const { nameChanged, isStoreNameValid } = validationState

  if (nameChanged && !isStoreNameValid) {
    toast.error('El nombre de la tienda ya está en uso o no es válido')
    return false
  }

  if (!storeId) {
    toast.error('ID de tienda no disponible')
    return false
  }

  try {
    const result = await updateUserStore({
      id: storeId,
      storeName: data.storeName.trim(),
      contactEmail: data.storeEmail?.trim() || '',
      contactPhone: Number(data.storePhone?.trim()) || 0,
    })

    if (result) {
      toast.success('Información de la tienda actualizada correctamente')
      if (onSuccess) {
        onSuccess()
      }
      if (onClose) {
        onClose()
      }
      return true
    } else {
      toast.error('No se pudo actualizar la información de la tienda')
      return false
    }
  } catch (error) {
    console.error('Error updating store information:', error)
    toast.error('Ocurrió un error al actualizar la información')
    return false
  }
}

/**
 * Initializes form with store data when dialog opens
 */
export const initializeStoreProfileForm = (
  open: boolean,
  initialData: { storeName?: string; contactEmail?: string; contactPhone?: string },
  form: UseFormReturn<StoreProfileFormValues>,
  setOriginalStoreName: Dispatch<SetStateAction<string>>,
  setNameChanged: Dispatch<SetStateAction<boolean>>,
  setIsStoreNameValid: Dispatch<SetStateAction<boolean>>
) => {
  if (open) {
    const storeName = initialData.storeName || ''
    setOriginalStoreName(storeName)
    setNameChanged(false)
    setIsStoreNameValid(true)
    form.reset({
      storeName,
      storePhone: initialData.contactPhone || '',
      storeEmail: initialData.contactEmail || '',
    })
  }
}
