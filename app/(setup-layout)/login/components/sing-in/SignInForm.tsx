'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
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
import { Checkbox } from '@/components/ui/checkbox'
import { signInSchema, type SignInFormData } from '@/lib/zod-schemas/schemas'
import { useAuth } from '@/app/(setup-layout)/login/hooks/SignIn'

interface SignInFormProps {
  onForgotPassword: () => void
  onVerificationNeeded: (email: string, password: string) => void
  redirectPath?: string
}

export function SignInForm({
  onForgotPassword,
  onVerificationNeeded,
  redirectPath = '/',
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuth({
    redirectPath,
    onVerificationNeeded,
  })

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSubmit = async (data: SignInFormData) => {
    try {
      await login(data.email, data.password)
      // Si el login es exitoso, la redirección la maneja el hook useAuth
    } catch (err) {
      // Los errores ya los maneja el hook useAuth
      form.setError('root', {
        type: 'manual',
        message: 'Error al iniciar sesión',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">{error}</div>}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  placeholder="correo@ejemplo.com"
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    clearError()
                  }}
                />
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
              <div className="flex items-center justify-between">
                <FormLabel>Contraseña</FormLabel>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal text-gray-600 underline"
                  onClick={e => {
                    e.preventDefault()
                    onForgotPassword()
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    {...field}
                    onChange={e => {
                      field.onChange(e)
                      clearError()
                    }}
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
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="text-sm font-normal">Recordarme</FormLabel>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black/90 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader color="white" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </Form>
  )
}
