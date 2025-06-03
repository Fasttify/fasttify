import { ExternalLink, AlertCircle, Key, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Option, Status } from '@/app/store/components/app-integration/constants/connectModal'

interface ConfigStepProps {
  option: Option
  onOptionChange: (option: Option) => void
  apiKey: string
  onApiKeyChange: (apiKey: string) => void
  status: Status
  errorMessage: string
  updateLoading: boolean
  updateError: any
  onExternalRedirect: () => void
}

export function ConfigStep({
  option,
  onOptionChange,
  apiKey,
  onApiKeyChange,
  status,
  errorMessage,
  updateLoading,
  updateError,
  onExternalRedirect,
}: ConfigStepProps) {
  return (
    <div className="space-y-6 py-4">
      <RadioGroup
        value={option || ''}
        onValueChange={value => onOptionChange(value as 'existing' | 'new')}
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
                      onChange={e => onApiKeyChange(e.target.value)}
                      disabled={status === 'loading'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Puedes encontrar tu API Key en la configuración de tu cuenta de Master Shop
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
                  onClick={onExternalRedirect}
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
  )
}
