'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useStoreDataStore from '@/context/core/storeDataStore'
import { useConnectModal } from '@/app/store/components/app-integration/hooks/useConnectModal'
import { IntroStep } from '@/app/store/components/app-integration/components/steps/IntroStep'
import { ConfigStep } from '@/app/store/components/app-integration/components/steps/ConfigStep'
import { SuccessStep } from '@/app/store/components/app-integration/components/steps/SuccessStep'
import {
  ConnectModalProps,
  MASTER_SHOP_LOGIN_URL,
} from '@/app/store/components/app-integration/constants/connectModal'
import { configureAmplify } from '@/lib/amplify-config'
import useUserStore from '@/context/core/userStore'

configureAmplify()

export function ConnectModal({ open, onOpenChange }: ConnectModalProps) {
  const { currentStore, hasMasterShopApiKey, checkMasterShopApiKey } = useStoreDataStore()
  const { user } = useUserStore()
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const {
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
  } = useConnectModal(currentStore, handleClose)

  // Efecto para mostrar paso 3 si ya tiene API key
  useEffect(() => {
    if (open && hasMasterShopApiKey) {
      setStep(3)
    }
  }, [open, hasMasterShopApiKey, setStep])

  // Handlers optimizados con useCallback
  const handleNext = useCallback(async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2 && option === 'existing') {
      const success = await handleApiKeyConnection()
      if (success) {
        setStep(3)
        if (currentStore?.storeId && user?.userId) {
          checkMasterShopApiKey(currentStore.storeId, user.userId)
        }
      }
    }
  }, [step, option, handleApiKeyConnection, setStep, currentStore?.storeId, checkMasterShopApiKey])

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1)
      setOption(null)
    } else if (step === 3) {
      setStep(2)
      setStatus('idle')
    }
  }, [step, setStep, setOption, setStatus])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setTimeout(resetState, 300)
      }
      onOpenChange(open)
    },
    [onOpenChange, resetState]
  )

  const handleExternalRedirect = useCallback(() => {
    window.open(MASTER_SHOP_LOGIN_URL, '_blank')
    setStatus('loading')

    setTimeout(() => {
      setStatus('success')
      setStep(3)
    }, 3000)
  }, [setStatus, setStep])

  // Memoizar el contenido de cada paso
  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return <IntroStep />
      case 2:
        return (
          <ConfigStep
            option={option}
            onOptionChange={setOption}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            status={status}
            errorMessage={errorMessage}
            updateLoading={updateLoading}
            updateError={updateError}
            onExternalRedirect={handleExternalRedirect}
          />
        )
      case 3:
        return <SuccessStep />
      default:
        return null
    }
  }, [
    step,
    option,
    setOption,
    apiKey,
    setApiKey,
    status,
    errorMessage,
    updateLoading,
    updateError,
    handleExternalRedirect,
  ])

  // Memoizar la lógica del botón
  const nextButtonDisabled = useMemo(() => {
    return (
      (step === 2 && !option) ||
      (step === 2 && option === 'existing' && !apiKey) ||
      status === 'loading'
    )
  }, [step, option, apiKey, status])

  const nextButtonContent = useMemo(() => {
    if (step === 1) return 'Continuar'
    if (hasMasterShopApiKey) {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          Master Shop Activo
        </>
      )
    }
    return 'Conectar'
  }, [step, hasMasterShopApiKey])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {hasMasterShopApiKey ? 'Master Shop Conectado' : 'Conectar con Master Shop'}
          </DialogTitle>
          <DialogDescription>
            {hasMasterShopApiKey
              ? 'Tu tienda está conectada con Master Shop. Puedes importar y sincronizar productos.'
              : 'Integra tu tienda con Master Shop para importar y sincronizar productos.'}
          </DialogDescription>
        </DialogHeader>

        {stepContent}

        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={status === 'loading'}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
          ) : (
            <div className="hidden sm:block"></div>
          )}

          {step < 3 ? (
            <Button
              className="w-full sm:w-auto bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors"
              onClick={handleNext}
              disabled={nextButtonDisabled}
            >
              {nextButtonContent}
              {!hasMasterShopApiKey && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button
              className={`w-full sm:w-auto ${
                hasMasterShopApiKey
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
              } h-9 px-4 text-sm font-medium text-white py-2 rounded-md transition-colors`}
              onClick={handleClose}
            >
              {hasMasterShopApiKey ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Master Shop Activo
                </>
              ) : (
                'Finalizar'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
