import { debounce } from 'lodash'
import { Dispatch, SetStateAction } from 'react'
import { StoreProfileFormValues } from '@/lib/zod-schemas/store-profile-schema'
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
  updateUserStore: (data: any) => Promise<any>
) => {
  const { nameChanged, isStoreNameValid } = validationState

  if (nameChanged && !isStoreNameValid) {
    console.error('Store name is already in use or invalid')
    return false
  }

  if (!storeId) {
    console.error('Store ID not available')
    return false
  }

  try {
    const result = await updateUserStore({
      storeId: storeId,
      storeName: data.storeName.trim(),
      contactEmail: data.storeEmail?.trim() || '',
      contactPhone: Number(data.storePhone?.trim()) || 0,
    })

    return !!result
  } catch (error) {
    console.error('Error updating store information:', error)
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
