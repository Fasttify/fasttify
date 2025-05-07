import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createApiKeySchema, PaymentGatewayType, PAYMENT_GATEWAYS } from '@/lib/schemas/api-keys'

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

type ApiKeyFormValues = {
  publicKey: string
  privateKey: string
}

interface ApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: ApiKeyFormValues & { gateway: PaymentGatewayType }) => Promise<void | boolean>
  gateway: PaymentGatewayType
}

export function ApiKeyModal({ open, onOpenChange, onSubmit, gateway }: ApiKeyModalProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const gatewayConfig = PAYMENT_GATEWAYS[gateway]

  const getFieldLabels = () => {
    if (gateway === 'wompi') {
      return {
        publicKeyLabel: 'Llave Pública',
        publicKeyDescription: 'Ingresa la llave pública desde tu panel de Wompi.',
        publicKeyTooltip:
          'Tu llave pública comienza con "pub_" y se utiliza para identificar tu cuenta de Wompi.',
        privateKeyLabel: 'Firma (Signature)',
        privateKeyDescription: 'Ingresa la firma (signature) desde tu panel de Wompi.',
        privateKeyTooltip:
          'La firma se utiliza para verificar la autenticidad de las transacciones.',
      }
    }
    return {
      publicKeyLabel: 'Access Token',
      publicKeyDescription: `Ingresa el Access Token desde tu panel de ${gatewayConfig.name}.`,
      publicKeyTooltip: `Tu Access Token comienza con "${gatewayConfig.publicKeyPrefix}" y se utiliza para identificar tu cuenta.`,
      privateKeyLabel: 'Clave Secreta',
      privateKeyDescription: `Ingresa la Clave Secreta desde tu panel de ${gatewayConfig.name}.`,
      privateKeyTooltip: `Tu Clave Secreta comienza con "${gatewayConfig.privateKeyPrefix}" y debe mantenerse en secreto. Se utiliza para autenticar las transacciones.`,
    }
  }

  const fieldLabels = getFieldLabels()

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema(gateway)),
    defaultValues: {
      publicKey: '',
      privateKey: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        {
          publicKey: '',
          privateKey: '',
        },
        {
          keepErrors: false,
        }
      )
    }
  }, [open, gateway, form])

  const handleModalChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset(
        {
          publicKey: '',
          privateKey: '',
        },
        {
          keepErrors: false,
        }
      )
      setShowPrivateKey(false)
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (data: ApiKeyFormValues) => {
    try {
      setIsSubmitting(true)

      if (onSubmit) {
        const result = await onSubmit({
          ...data,
          gateway,
        })

        if (result !== false) {
          handleModalChange(false)
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
        handleModalChange(false)
      }
    } catch (error) {
      console.error('Error al guardar las claves:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuración de {gatewayConfig.name}</DialogTitle>
          <DialogDescription>
            Ingresa tus claves API de {gatewayConfig.name} para habilitar el procesamiento de pagos.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Tus claves API se utilizan para autenticar solicitudes a la pasarela de pago. Estas
              claves se almacenan de forma segura y encriptada. Nunca compartimos tu clave privada
              con terceros.
            </p>
          </div>
        </div>

        <Card className={`border ${gatewayConfig.color}`}>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{gatewayConfig.name}</div>
              <Badge variant="outline" className={gatewayConfig.color}>
                {gatewayConfig.transactionFee}% por transacción
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{gatewayConfig.description}</p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {fieldLabels.publicKeyLabel}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldLabels.publicKeyTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={gatewayConfig.publicKeyPlaceholder}
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>{fieldLabels.publicKeyDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="privateKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {fieldLabels.privateKeyLabel}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldLabels.privateKeyTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPrivateKey ? 'text' : 'password'}
                        placeholder={gatewayConfig.privateKeyPlaceholder}
                        {...field}
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPrivateKey ? 'Ocultar' : 'Mostrar'} {fieldLabels.privateKeyLabel}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>{fieldLabels.privateKeyDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-gray-800 h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : `Guardar Claves de ${gatewayConfig.name}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
