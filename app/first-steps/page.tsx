'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Store, User, Settings, InfoIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BackgroundGradientAnimation } from '@/app/first-steps/components/BackgroundGradientAnimation'
import { useUserStoreData } from '@/app/first-steps/hooks/useUserStoreData'
import { MultiStepLoader } from '@/app/first-steps/components/MultiStepLoader'
import Image from 'next/image'
import PersonalInfo from '@/app/first-steps/components/PersonalInfo'
import StoreInfo from '@/app/first-steps/components/StoreInfo'
import AdditionalSettings from '@/app/first-steps/components/AdditionalSettings'
import {
  personalInfoSchema,
  storeInfoSchema,
  additionalSettingsSchema,
} from '@/lib/schemas/first-step'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { v4 as uuidv4 } from 'uuid'
import { routes } from '@/utils/routes'
import sellingOptions from '@/app/first-steps/data/selling-options.json'

export default function FirstStepsPage() {
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
  const { loading, createUserStore } = useUserStoreData()

  const cognitoUsername =
    userData && userData['cognito:username'] ? userData['cognito:username'] : null

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }
  const { options } = sellingOptions

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

      const storeInput = {
        userId: cognitoUsername,
        storeId: `${uuidv4()}`,
        storeType: selectedOption || '',
        storeName: formData.storeName,
        storeDescription: formData.description,
        storeCurrency: 'COP',
        storeAdress: formData.location,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        contactName: formData.fullName,
        conctactIdentification: formData.documentNumber,
        contactIdentificationType: formData.documentType,
        wompiConfig: JSON.stringify({
          publicKey: formData.wompiConfig.publicKey,
          signature: formData.wompiConfig.signature,
        }),
        onboardingCompleted: true,
      }
      const result = await createUserStore(storeInput)
      if (result) {
        setTimeout(() => {
          window.location.href = routes.store.dashboard(result.storeId)
        }, 3000)
      } else {
        setSaving(false)
      }
    }
  }

  const handleQuickSetup = async () => {
    if (!cognitoUsername) return

    setSaving(true)
    const quickStoreId = uuidv4()

    const quickStoreInput = {
      userId: cognitoUsername,
      storeId: quickStoreId,
      storeName: `Tienda ${quickStoreId.slice(0, 4)}`,
      storeType: 'quick-setup',
      storeCurrency: 'COP',
      onboardingCompleted: true,
    }

    const result = await createUserStore(quickStoreInput)

    if (result) {
      setTimeout(() => {
        window.location.href = routes.store.dashboard(result.storeId)
      }, 3000)
    } else {
      setSaving(false)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  useEffect(() => {
    document.title = 'Creando tu tienda • Fasttify'
  }, [])

  if (loading || saving) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MultiStepLoader
          loadingStates={[
            { text: 'Configurando tu tienda' },
            { text: 'Creando tu tienda' },
            { text: 'Configurando tu tienda' },
            { text: 'Listo' },
          ]}
          loading={true}
        />
      </div>
    )
  }

  const handleStepValidation = (isValid: boolean) => {
    setIsStepValid(isValid)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepWrapper key="step1">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                ¿Dónde quieres vender con Fasttify?
              </h1>
              <p className="text-gray-600">
                Configuraremos todo para que puedas empezar a vender sin complicaciones en los
                canales que elijas.
              </p>

              {/* New information box about quick setup */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">¿Con prisa?</span> Puedes usar la opción de
                    <button
                      onClick={handleQuickSetup}
                      className="mx-1 font-medium text-blue-600 underline hover:text-blue-800"
                    >
                      configuración rápida
                    </button>
                    para crear tu tienda al instante con un nombre temporal. No te preocupes, podrás
                    personalizar todos los detalles más adelante.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {options.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`p-6 rounded-xl text-left transition-all ${
                    selectedOption === option.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors ${
                        selectedOption === option.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedOption === option.id && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </StepWrapper>
        )
      case 2:
        return (
          <StepWrapper key="step2">
            <PersonalInfo data={formData} updateData={updateFormData} errors={validationErrors} />
          </StepWrapper>
        )
      case 3:
        return (
          <StepWrapper key="step3">
            <StoreInfo
              data={formData}
              updateData={updateFormData}
              errors={validationErrors}
              onValidationChange={handleStepValidation}
            />
          </StepWrapper>
        )
      case 4:
        return (
          <StepWrapper key="step4">
            <AdditionalSettings
              data={formData}
              updateData={updateFormData}
              errors={validationErrors}
            />
          </StepWrapper>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <Image
          src="/icons/fasttify-white.webp"
          priority={true}
          alt="Fasttify Logo"
          width={50}
          height={50}
        />
      </div>
      <div className="absolute inset-0 z-0 sm:block hidden">
        <BackgroundGradientAnimation />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-3xl bg-[#ffff] bg-opacity-90 backdrop-blur-sm rounded-[2rem] border shadow p-8 relative"
        >
          {/* Progress Header */}
          {step > 1 && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <User size={20} />
                </div>
                <div className="h-1 w-12 bg-gray-200">
                  <div
                    className={`h-full bg-blue-500 transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`}
                  />
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <Store size={20} />
                </div>
                <div className="h-1 w-12 bg-gray-200">
                  <div
                    className={`h-full bg-blue-500 transition-all duration-300 ${step >= 4 ? 'w-full' : 'w-0'}`}
                  />
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <Settings size={20} />
                </div>
              </div>
              <span className="text-sm text-gray-500 sm:ml-0 ml-4">Paso {step} de 4</span>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {renderStep()}
          </AnimatePresence>

          <div className="mt-8 flex justify-between items-center">
            {step === 1 ? (
              <button
                onClick={handleQuickSetup}
                disabled={saving}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                No necesito ayuda con la configuración →
              </button>
            ) : (
              <button
                onClick={prevStep}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Atrás
              </button>
            )}
            <Button
              variant="ghost"
              onClick={nextStep}
              disabled={(step === 1 && !selectedOption) || (step === 3 && !isStepValid) || saving}
              className="px-0 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>{step === 4 ? (saving ? 'Guardando...' : 'Finalizar') : 'Siguiente'}</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const StepWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ type: 'tween', stiffness: 260, damping: 20 }}
  >
    {children}
  </motion.div>
)
