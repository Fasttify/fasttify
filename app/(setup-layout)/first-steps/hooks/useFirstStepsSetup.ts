import { useState } from 'react'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { useApiKeyEncryption } from '@/app/(setup-layout)/first-steps/hooks/useApiKeyEncryption'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { v4 as uuidv4 } from 'uuid'
import { routes } from '@/utils/routes'
import {
  personalInfoSchema,
  storeInfoSchema,
  additionalSettingsSchema,
} from '@/lib/zod-schemas/first-step'
import sellingOptionsData from '@/app/(setup-layout)/first-steps/data/selling-options.json'

export const useFirstStepsSetup = () => {
  const [step, setStep] = useState(1)
  const [isStepValid, setIsStepValid] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',

    storeName: '',
    description: '',
    location: '',
    category: '',
    policies: '',
    customDomain: '',

    wompiConfig: {
      publicKey: '',
      signature: '',
    },
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const { userData } = useAuthUser()
  const { loading, createUserStore, createStoreWithTemplate } = useUserStoreData()
  const { encryptApiKey } = useApiKeyEncryption()

  const cognitoUsername =
    userData && userData['cognito:username'] ? userData['cognito:username'] : null

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }
  const { options } = sellingOptionsData

  // Función para validar el paso actual
  const validateStep = (): boolean => {
    setValidationErrors({})
    let result
    if (step === 2) {
      result = personalInfoSchema.safeParse(formData)
    } else if (step === 3) {
      result = storeInfoSchema.safeParse(formData)
    } else if (step === 4) {
      result = additionalSettingsSchema.safeParse(formData)
    }
    if (result && !result.success) {
      if (step === 4) {
        setValidationErrors(result.error.format())
      } else {
        setValidationErrors(result.error.flatten().fieldErrors)
      }
      return false
    }
    return true
  }

  // Función para avanzar de paso, ejecutando la validación en cada cambio de paso
  const nextStep = async () => {
    if (step >= 2 && step <= 4) {
      const valid = validateStep()
      if (!valid) return
    }
    if (step === 1 && selectedOption) {
      setStep(2)
    } else if (step < 4) {
      setStep(prev => prev + 1)
    } else if (step === 4) {
      setSaving(true)

      try {
        // Cifrar las claves de Wompi usando la Lambda
        let encryptedPublicKey = null
        let encryptedSignature = null

        if (formData.wompiConfig.publicKey) {
          encryptedPublicKey = await encryptApiKey(
            formData.wompiConfig.publicKey,
            'wompi',
            'publicKey'
          )
        }

        if (formData.wompiConfig.signature) {
          encryptedSignature = await encryptApiKey(
            formData.wompiConfig.signature,
            'wompi',
            'signature'
          )
        }

        const storeInput = {
          userId: cognitoUsername,
          storeId: `${uuidv4().slice(0, 7)}`,
          storeType: selectedOption || '',
          storeName: formData.storeName,
          storeDescription: formData.description,
          storeCurrency: 'COP',
          storeAdress: formData.location,
          contactEmail: formData.email,
          contactPhone: parseInt(formData.phone),
          contactName: formData.fullName,
          customDomain:
            formData.customDomain ||
            `${formData.storeName.toLowerCase().replace(/\s+/g, '-')}.fasttify.com`,
          conctactIdentification: formData.documentNumber,
          contactIdentificationType: formData.documentType,
          wompiConfig: JSON.stringify({
            isActive: true,
            publicKey: encryptedPublicKey || formData.wompiConfig.publicKey,
            signature: encryptedSignature || formData.wompiConfig.signature,
          }),
          onboardingCompleted: true,
        }

        const result = await createStoreWithTemplate(storeInput)
        if (result) {
          setTimeout(() => {
            window.location.href = routes.store.dashboard.main(result.store.storeId)
          }, 3000)
        } else {
          setSaving(false)
        }
      } catch (error) {
        console.error('Error al cifrar las claves API:', error)
        setSaving(false)
      }
    }
  }

  const handleQuickSetup = async () => {
    if (!cognitoUsername) return

    setSaving(true)
    const quickStoreId = uuidv4()
    const storeIdShort = quickStoreId.slice(0, 7)
    const storeName = `Tienda ${storeIdShort}`

    const quickStoreInput = {
      userId: cognitoUsername,
      storeId: storeIdShort,
      storeName: storeName,
      customDomain: `${storeName.toLowerCase().replace(/\s+/g, '-')}.fasttify.com`,
      storeType: 'quick-setup',
      storeCurrency: 'COP',
      onboardingCompleted: true,
    }

    const result = await createStoreWithTemplate(quickStoreInput)

    if (result) {
      setTimeout(() => {
        window.location.href = routes.store.dashboard.main(result.store.storeId)
      }, 3000)
    } else {
      setSaving(false)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const handleStepValidation = (isValid: boolean) => {
    setIsStepValid(isValid)
  }

  return {
    step,
    setStep,
    isStepValid,
    setIsStepValid,
    selectedOption,
    setSelectedOption,
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    saving,
    setSaving,
    userData,
    loading,
    createUserStore,
    encryptApiKey,
    cognitoUsername,
    updateFormData,
    options,
    validateStep,
    nextStep,
    handleQuickSetup,
    prevStep,
    handleStepValidation,
  }
}
