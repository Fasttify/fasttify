'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from '@/components/ui/loader';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import {
  forgotPasswordSchema,
  confirmResetPasswordSchema,
  type ForgotPasswordFormData,
  type ConfirmResetPasswordFormData,
} from '@/lib/zod-schemas/schemas';
import { OTPInput, type SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

type ResetPasswordStep = 'INITIAL' | 'CONFIRM_CODE' | 'DONE';

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ResetPasswordStep>('INITIAL');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  const resetForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const confirmForm = useForm<ConfirmResetPasswordFormData>({
    resolver: zodResolver(confirmResetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResetPassword = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const output = await resetPassword({ username: data.email });
      const { nextStep } = output;

      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setEmail(data.email);
        setDeliveryMethod(nextStep.codeDeliveryDetails.deliveryMedium || '');
        setCurrentStep('CONFIRM_CODE');
        setTimer(60);
      }
    } catch (err) {
      if (err instanceof Error) {
        switch (err.name) {
          case 'UserNotFoundException':
            setError('No existe una cuenta asociada a este correo electrónico.');
            break;
          case 'LimitExceededException':
            setError('Has excedido el límite de intentos. Por favor, intenta más tarde.');
            break;
          case 'InvalidParameterException':
            setError('Por favor, ingresa un correo electrónico válido.');
            break;
          default:
            setError('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (data: ConfirmResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await confirmResetPassword({
        username: email,
        confirmationCode: data.code,
        newPassword: data.newPassword,
      });

      setCurrentStep('DONE');
    } catch (err) {
      if (err instanceof Error) {
        switch (err.name) {
          case 'CodeMismatchException':
            setError('El código ingresado no es válido. Por favor, verifica e intenta nuevamente.');
            break;
          case 'ExpiredCodeException':
            setError('El código ha expirado. Por favor, solicita uno nuevo.');
            break;
          case 'InvalidPasswordException':
            setError('La contraseña no cumple con los requisitos de seguridad.');
            break;
          default:
            setError('Ocurrió un error al confirmar tu nueva contraseña. Por favor, intenta nuevamente.');
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'DONE') {
    return (
      <div className="text-center">
        <p className="mb-4">Tu contraseña ha sido restablecida exitosamente.</p>
        <Button type="button" variant="ghost" onClick={onBack} className="mt-4 w-full">
          Volver al inicio de sesión
        </Button>
      </div>
    );
  }

  if (currentStep === 'CONFIRM_CODE') {
    return (
      <Form {...confirmForm}>
        <form onSubmit={confirmForm.handleSubmit(handleConfirmReset)} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
          <p className="text-sm text-gray-600">
            Se ha enviado un código de verificación a través de {deliveryMethod.toLowerCase()}
          </p>
          <FormField
            control={confirmForm.control}
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
          <FormField
            control={confirmForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showNewPassword ? 'text' : 'password'} {...field} />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={confirmForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showConfirmPassword ? 'text' : 'password'} {...field} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-black text-white hover:bg-black/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader color="white" />
                Confirmando...
              </>
            ) : (
              'Confirmar nueva contraseña'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCurrentStep('INITIAL')}
            className="w-full"
            disabled={isLoading}>
            Volver
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...resetForm}>
      <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
        {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
        <FormField
          control={resetForm.control}
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
        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={isLoading || timer > 0}>
          {isLoading ? 'Enviando...' : timer > 0 ? `Espera ${timer} segundos` : 'Enviar instrucciones'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="w-full underline"
          disabled={isLoading}>
          Volver al inicio de sesión
        </Button>
      </form>
    </Form>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'flex size-9 items-center justify-center rounded-lg border border-input bg-background font-medium text-foreground shadow-sm shadow-black/5 transition-shadow',
        { 'z-10 border border-ring ring-[3px] ring-ring/20': props.isActive }
      )}>
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}
