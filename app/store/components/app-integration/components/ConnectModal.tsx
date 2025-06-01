import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ExternalLink,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Key,
  PlusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import useStoreDataStore from '@/context/core/storeDataStore'
import { useApiKeyEncryption } from '@/app/(setup-layout)/first-steps/hooks/useApiKeyEncryption'
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

type Step = 1 | 2 | 3

interface ConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectModal({ open, onOpenChange }: ConnectModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [option, setOption] = useState<'existing' | 'new' | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { updateUserStore, loading: updateLoading, error: updateError } = useUserStoreData()
  const { encryptApiKey } = useApiKeyEncryption()
  const { currentStore, hasMasterShopApiKey, checkMasterShopApiKey } = useStoreDataStore()

  // Si ya tiene API key configurada, mostrar el paso 3 directamente
  useEffect(() => {
    if (open && hasMasterShopApiKey) {
      setStep(3)
    }
  }, [open, hasMasterShopApiKey])

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2 && option === 'existing') {
      setStatus('loading')

      if (apiKey.length < 5) {
        setStatus('error')
        setErrorMessage(
          'La API Key proporcionada no es válida. Por favor verifica e intenta nuevamente.'
        )
        return
      }

      if (currentStore?.storeId) {
        try {
          const encryptedKey = await encryptApiKey(
            apiKey,
            'mastershop',
            undefined,
            currentStore.storeId
          )

          if (!encryptedKey) {
            console.error('Error encrypting the Master Shop API Key')
            setStatus('error')
            setErrorMessage('No se pudo configurar la integración. Por favor intenta nuevamente.')
            return
          }

          // Actualizamos la tienda con la API Key encriptada de Master Shop
          const result = await updateUserStore({
            storeId: currentStore.storeId,
            mastershopApiKey: encryptedKey,
          })

          if (result) {
            setStatus('success')
            setStep(3)

            checkMasterShopApiKey(currentStore.storeId)
          } else {
            setStatus('error')
            setErrorMessage('No se pudo guardar la configuración. Por favor intenta nuevamente.')
          }
        } catch (error) {
          setStatus('error')
          setErrorMessage(
            'Ocurrió un error al guardar la configuración. Por favor intenta nuevamente.'
          )
          console.error('Error saving API Key:', error)
        }
      } else {
        setTimeout(() => {
          setStatus('success')
          setStep(3)
        }, 1500)
      }
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setOption(null)
    } else if (step === 3) {
      setStep(2)
      setStatus('idle')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setStep(1)
        setOption(null)
        setApiKey('')
        setStatus('idle')
        setErrorMessage('')
      }, 300)
    }
    onOpenChange(open)
  }

  const handleExternalRedirect = () => {
    window.open('https://app.mastershop.com/login', '_blank')
    setStatus('loading')

    setTimeout(() => {
      setStatus('success')
      setStep(3)
    }, 3000)
  }

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

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <Image
                  src="/svgs/mastershop-svg.svg"
                  alt="Master Shop Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">Master Shop</h3>
                <p className="text-sm text-muted-foreground">
                  Plataforma líder para gestión de productos e inventario
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Beneficios de la integración:</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span>Importación automática de productos desde Master Shop</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span>Sincronización de inventario en tiempo real</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span>Actualización automática de precios y descripciones</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span>Gestión centralizada de tu catálogo de productos</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <RadioGroup
              value={option || ''}
              onValueChange={value => setOption(value as 'existing' | 'new')}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="existing" id="existing" />
                  <div className="flex flex-col">
                    <Label htmlFor="existing" className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" /> Ya tengo cuenta en Master Shop
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Conecta con tu cuenta existente usando una API Key
                    </p>

                    {option === 'existing' && (
                      <div className="mt-4 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="apikey">API Key de Master Shop</Label>
                          <Input
                            id="apikey"
                            placeholder="Ingresa tu API Key"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            disabled={status === 'loading'}
                          />
                          <p className="text-xs text-muted-foreground">
                            Puedes encontrar tu API Key en la configuración de tu cuenta de Master
                            Shop
                          </p>
                        </div>

                        {status === 'error' && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="new" id="new" />
                  <div className="flex flex-col">
                    <Label htmlFor="new" className="font-medium flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" /> Crear cuenta en Master Shop
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido al sitio web de Master Shop para crear una cuenta
                    </p>

                    {option === 'new' && (
                      <Button
                        variant="outline"
                        className="mt-4 w-fit"
                        onClick={handleExternalRedirect}
                        disabled={status === 'loading'}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ir a Master Shop
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </RadioGroup>

            {status === 'loading' && (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2 text-sm">
                  {updateLoading ? 'Guardando configuración...' : 'Verificando conexión...'}
                </span>
              </div>
            )}

            {updateError && status === 'error' && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'Ocurrió un error al guardar la configuración.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">¡Conexión Exitosa!</h3>
              <p className="mt-2 text-muted-foreground">
                Tu tienda Fasttify ha sido conectada correctamente con Master Shop.
              </p>
            </div>

            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Integración Activa</AlertTitle>
              <AlertDescription>
                Ahora puedes importar y sincronizar productos desde Master Shop. Ve a la sección de
                Productos para comenzar.
              </AlertDescription>
            </Alert>
          </div>
        )}

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
              disabled={
                (step === 2 && !option) ||
                (step === 2 && option === 'existing' && !apiKey) ||
                status === 'loading'
              }
            >
              {step === 1 ? (
                'Continuar'
              ) : hasMasterShopApiKey ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Master Shop Activo
                </>
              ) : (
                'Conectar'
              )}
              {!hasMasterShopApiKey && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button
              className={`w-full sm:w-auto ${hasMasterShopApiKey ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'} h-9 px-4 text-sm font-medium text-white py-2 rounded-md transition-colors`}
              onClick={() => handleOpenChange(false)}
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
