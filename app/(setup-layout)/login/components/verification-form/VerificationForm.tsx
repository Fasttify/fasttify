'use client';

import { useState } from 'react';
import { Loader } from '@/components/ui/loader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleConfirmSignUp } from '@/app/(setup-layout)/login/hooks/signUp';
import { signIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { verificationSchema, type VerificationFormData } from '@/lib/zod-schemas/schemas';
import { OTPInput, type SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/hooks/useAuth';
import { getConfirmSignUpErrorMessage } from '@/lib/auth-error-messages';

interface VerificationFormProps {
  email: string;
  password: string;
  onBack: () => void;
}

export function VerificationForm({ email, password, onBack }: VerificationFormProps) {
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { checkUser } = useAuth();

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    setIsSubmitted(true);
    try {
      const isCompleted = await handleConfirmSignUp(email, data.code, checkUser);
      if (isCompleted) {
        // Iniciar sesión automáticamente
        await signIn({ username: email, password: password });
        // Refrescar el estado del usuario después del login
        await checkUser();
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(getConfirmSignUpErrorMessage(err));
      setIsSubmitted(false);
    }
  };

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

        <Button type="submit" className="w-full bg-black text-white hover:bg-black/90" disabled={isSubmitted}>
          {isSubmitted ? (
            <>
              <Loader color="white" /> Verificando código
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
