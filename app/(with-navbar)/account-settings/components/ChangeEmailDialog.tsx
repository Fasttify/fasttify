import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useUserAttributes } from '@/app/(with-navbar)/account-settings/hooks/useUserAttributes'
import { emailSchema, verificationCodeSchema } from '@/lib/schemas/email-change'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/custom-toast/use-toast'
import { Toast } from '@/components/ui/toasts'
import type { z } from 'zod'
import { OTPInput, type SlotProps } from 'input-otp'
import { cn } from '@/lib/utils'

interface ChangeEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}

type EmailFormData = z.infer<typeof emailSchema>
type VerificationFormData = z.infer<typeof verificationCodeSchema>

export function ChangeEmailDialog({ open, onOpenChange, currentEmail }: ChangeEmailDialogProps) {
  const [requiresVerification, setRequiresVerification] = useState(false)
  const { updateAttributes, confirmAttribute, loading } = useUserAttributes()
  const { toasts, addToast, removeToast } = useToast()

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const {
    register: registerVerification,
    handleSubmit: handleSubmitVerification,
    formState: { errors: verificationErrors },
    reset: resetVerification,
    setValue: setVerificationValue,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationCodeSchema),
  })

  const onSubmitEmail = async (data: EmailFormData) => {
    if (data.email.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      addToast('No puedes usar tu mismo correo actual', 'error')
      return
    }
    try {
      const updateResult = await updateAttributes({ email: data.email })

      resetEmail()

      if (updateResult.email.nextStep.updateAttributeStep === 'CONFIRM_ATTRIBUTE_WITH_CODE') {
        setRequiresVerification(true)
      }
    } catch (err) {
      handleError(err)
    }
  }

  const onSubmitVerification = async (data: VerificationFormData) => {
    try {
      await confirmAttribute({
        userAttributeKey: 'email',
        confirmationCode: data.verificationCode,
      })

      addToast('Tu correo electrónico ha sido actualizado exitosamente.', 'success')
      onOpenChange(false)

      resetVerification()
    } catch (err) {
      let errorCode = ''
      let errorMessage = ''
      if (err && typeof err === 'object') {
        errorCode = (err as any).code || ''
        errorMessage = (err as any).message || ''
      } else {
        errorMessage = String(err)
      }

      if (
        errorCode === 'CodeMismatchException' ||
        errorMessage.includes('Invalid verification code')
      ) {
        addToast('El código es incorrecto, inténtalo de nuevo', 'error')
        return
      }
      if (
        errorCode === 'LimitExceededException' ||
        errorMessage.includes('Attempt limit exceeded')
      ) {
        addToast('Has excedido el límite de intentos, por favor intenta más tarde', 'error')
        return
      }
      handleError(err)
    }
  }

  const handleError = (err: unknown) => {
    console.error('Error detallado:', err)
    let errorMessage = 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.'
    if (err instanceof Error) {
      errorMessage = err.message
    }
    addToast(errorMessage, 'error')
  }

  useEffect(() => {
    if (!open) {
      resetEmail()
      resetVerification()
      setRequiresVerification(false)
    }
  }, [open, resetEmail, resetVerification])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar correo electrónico</DialogTitle>
            <DialogDescription>
              {requiresVerification
                ? 'Introduce el código de verificación enviado a tu nuevo correo electrónico.'
                : 'Introduce tu nuevo correo electrónico.'}
            </DialogDescription>
          </DialogHeader>
          {!requiresVerification ? (
            <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
              <Input placeholder="email@gmail.com" {...registerEmail('email')} />
              {emailErrors.email && (
                <p className="text-sm text-red-500">{emailErrors.email.message}</p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    'Cambiar correo electrónico'
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmitVerification(onSubmitVerification)} className="space-y-4">
              <OTPInput
                maxLength={6}
                containerClassName="flex items-center justify-center gap-2 has-[:disabled]:opacity-50"
                onChange={value => setVerificationValue('verificationCode', value)}
                render={({ slots }) => (
                  <div className="flex gap-2">
                    {slots.map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                )}
              />
              {verificationErrors.verificationCode && (
                <p className="text-sm text-red-500">
                  {verificationErrors.verificationCode.message}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    'Verificar y cambiar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
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
