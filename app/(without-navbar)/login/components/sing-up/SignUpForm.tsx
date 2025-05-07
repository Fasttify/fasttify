'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { handleSignUp } from '@/app/(without-navbar)/login/hooks/signUp'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signUpSchema, type SignUpFormData } from '@/lib/schemas/schemas'
import Link from 'next/link'

interface SignUpFormProps {
  onVerificationNeeded: (email: string, password: string) => void
}

export function SignUpForm({ onVerificationNeeded }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nickName: '',
    },
  })

  const getErrorMessage = (error: any): string => {
    // Manejo por código de error
    if (error.code) {
      switch (error.code) {
        case 'UsernameExistsException':
          return 'Este correo electrónico ya está registrado'
        case 'InvalidParameterException':
          return 'Uno o más campos contienen datos inválidos'
        case 'InvalidPasswordException':
          return 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos'
        case 'TooManyRequestsException':
          return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente'
      }
    }

    // Manejo por mensaje de error
    switch (error.message) {
      case 'Username should be an email.':
        return 'El correo electrónico no tiene un formato válido'
      case 'Password did not conform with policy: Password not long enough':
        return 'La contraseña debe tener al menos 8 caracteres'
      case 'User already exists':
        return 'Este usuario ya existe'
      case 'Attempt limit exceeded, please try after some time.':
        return 'Límite de intentos excedido, por favor intenta más tarde'
      case 'Invalid verification code provided, please try again.':
        return 'Código de verificación inválido, por favor intenta nuevamente'
      default:
        return 'Ha ocurrido un error. Por favor, intenta nuevamente'
    }
  }

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitted(true)
    try {
      const result = await handleSignUp(data.email, data.password, data.nickName)
      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        onVerificationNeeded(data.email, data.password)
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      form.setError('root', { message: errorMessage })
      setIsSubmitted(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crea tu contraseña"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirma tu contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nickName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre y Apellido</FormLabel>
              <FormControl>
                <Input placeholder="Elige tu nombre y apellido" {...field} />
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
              <Loader color="white" /> Creando cuenta
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
        <p className="text-sm text-gray-600 max-w-[400px] text-center">
          Si continúas, aceptas los{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Términos del servicio
          </Link>{' '}
          y confirmas que has leído nuestra{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Política de privacidad
          </Link>
          .
        </p>
      </form>
    </Form>
  )
}
