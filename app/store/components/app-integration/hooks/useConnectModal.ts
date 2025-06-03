import { useState, useCallback } from 'react'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { useApiKeyEncryption } from '@/app/(setup-layout)/first-steps/hooks/useApiKeyEncryption'
import {
  Step,
  Option,
  Status,
  MIN_API_KEY_LENGTH,
} from '@/app/store/components/app-integration/constants/connectModal'

export function useConnectModal(currentStore: any, onClose: () => void) {
  const [step, setStep] = useState<Step>(1)
  const [option, setOption] = useState<Option>(null)
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { updateUserStore, loading: updateLoading, error: updateError } = useUserStoreData()
  const { encryptApiKey } = useApiKeyEncryption()

  const resetState = useCallback(() => {
    setStep(1)
    setOption(null)
    setApiKey('')
    setStatus('idle')
    setErrorMessage('')
  }, [])

  const validateApiKey = useCallback((key: string) => {
    if (key.length < MIN_API_KEY_LENGTH) {
      setStatus('error')
      setErrorMessage(
        'La API Key proporcionada no es válida. Por favor verifica e intenta nuevamente.'
      )
      return false
    }
    return true
  }, [])

  const handleApiKeyConnection = useCallback(async () => {
    if (!validateApiKey(apiKey) || !currentStore?.storeId) return false

    setStatus('loading')

    try {
      const encryptedKey = await encryptApiKey(
        apiKey,
        'mastershop',
        undefined,
        currentStore.storeId
      )

      if (!encryptedKey) {
        throw new Error('Error encrypting the Master Shop API Key')
      }

      const result = await updateUserStore({
        storeId: currentStore.storeId,
        mastershopApiKey: encryptedKey,
      })

      if (result) {
        setStatus('success')
        return true
      } else {
        throw new Error('No se pudo guardar la configuración')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Ocurrió un error al guardar la configuración. Por favor intenta nuevamente.')
      console.error('Error saving API Key:', error)
      return false
    }
  }, [apiKey, currentStore?.storeId, encryptApiKey, updateUserStore, validateApiKey])

  return {
    step,
    setStep,
    option,
    setOption,
    apiKey,
    setApiKey,
    status,
    setStatus,
    errorMessage,
    updateLoading,
    updateError,
    resetState,
    handleApiKeyConnection,
  }
}
