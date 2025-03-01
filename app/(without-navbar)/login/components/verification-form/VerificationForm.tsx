'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { handleConfirmSignUp } from '@/app/(without-navbar)/login/hooks/signUp'
import { signIn } from 'aws-amplify/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { verificationSchema, type VerificationFormData } from '@/lib/schemas/schemas'
import { OTPInput, type SlotProps } from 'input-otp'
import { cn } from '@/lib/utils'

interface VerificationFormProps {
  email: string
  password: string
  onBack: () => void
}

export function VerificationForm({ email, password, onBack }: VerificationFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  })

  const getErrorMessage = (error: any): string => {
    // Manejo por código de error
    if (error.code) {
      switch (error.code) {
        case 'CodeMismatchException':
          return 'El código ingresado no es válido. Por favor, verifica e intenta nuevamente'
        case 'ExpiredCodeException':
          return 'El código ha expirado. Por favor, solicita un nuevo código'
        case 'TooManyRequestsException':
          return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente'
        case 'NotAuthorizedException':
          return 'No se pudo autorizar la verificación. Por favor, intenta nuevamente'
        case 'UserNotFoundException':
          return 'No se encontró el usuario asociado a este correo'
        case 'LimitExceededException':
          return 'Has excedido el límite de intentos permitidos. Por favor, espera unos minutos'
      }
    }

    // Manejo por mensaje de error
    switch (error.message) {
      case 'Invalid verification code provided, please try again.':
        return 'Código de verificación inválido, por favor intenta nuevamente'
      case 'Attempt limit exceeded, please try after some time.':
        return 'Límite de intentos excedido, por favor intenta más tarde'
      case 'User cannot be confirmed. Current status is CONFIRMED':
        return 'El usuario ya ha sido confirmado anteriormente'
      case 'Network error':
        return 'Error de conexión. Por favor, verifica tu conexión a internet'
      default:
        return 'Ha ocurrido un error durante la verificación. Por favor, intenta nuevamente'
    }
  }

  const onSubmit = async (data: VerificationFormData) => {
    setIsSubmitted(true)
    try {
      const isCompleted = await handleConfirmSignUp(email, data.code)
      if (isCompleted) {
        // Iniciar sesión automáticamente
        await signIn({ username: email, password: password })
        router.push('/')
      }
    } catch (err: any) {
      setError(getErrorMessage(err))
      setIsSubmitted(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">{error}</div>}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de verificación</FormLabel>
              <FormControl>
                <OTPInput
                  maxLength={6}
                  containerClassName="flex items-center gap-2 has-[:disabled]:opacity-50"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, idx) => (
                        <Slot key={idx} {...slot} />
                      ))}
                    </div>
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={isSubmitted}
        >
          {isSubmitted ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Verificando código
            </>
          ) : (
            'Verificar código'
          )}
        </Button>

        <Button type="button" variant="ghost" onClick={onBack} className="w-full">
          Volver
        </Button>
      </form>
    </Form>
  )
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'flex size-9 items-center justify-center rounded-lg border border-input bg-background font-medium text-foreground shadow-sm shadow-black/5 transition-shadow',
        { 'z-10 border border-ring ring-[3px] ring-ring/20': props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  )
}
