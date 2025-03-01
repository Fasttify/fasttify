'use client'

import type React from 'react'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import cancelAnimation from '@/app/(with-navbar)/account-settings/anim/cancel-animation.json'
import successAnimation from '@/app/(with-navbar)/account-settings/anim/success-animation.json'

interface CancellationDialogProps {
  onCancel: () => Promise<void>
  isSubmitting: boolean
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
  isPendingFree: boolean
  expirationDate?: Date
}

export function CancellationDialog({
  onCancel,
  isSubmitting,
  setIsSubmitting,
  isPendingFree,
  expirationDate,
}: CancellationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setIsSubmitting(true)
    try {
      await onCancel()
      setIsCancelled(true)
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsCancelled(false)
  }

  const formattedExpirationDate = expirationDate
    ? format(expirationDate, "d 'de' MMMM, yyyy", { locale: es })
    : null

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isSubmitting || isPendingFree}
          className="w-auto self-start text-red-500 hover:text-red-500"
        >
          Cancelar Suscripción
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-xl overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!isCancelled ? (
            <motion.div
              key="cancel-confirmation"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <AlertDialogHeader>
                <div className="mx-auto w-32 h-32 mb-4">
                  <Lottie animationData={cancelAnimation} loop={true} />
                </div>
                <AlertDialogTitle className="text-center">
                  ¿Estás seguro de cancelar tu suscripción?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Al cancelar tu suscripción:
                  <ul className="list-disc list-inside mt-2 text-left">
                    <li>Tendrás acceso hasta el final del período de facturación actual.</li>
                    <li>Una vez cancelada, no podrás reactivar esta suscripción.</li>
                    <li>
                      Para volver a acceder a los beneficios, deberás comprar una nueva suscripción.
                    </li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Cancelación'}
                </Button>
              </AlertDialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="cancellation-success"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <AlertDialogHeader>
                <div className="mx-auto w-32 h-32 mb-4 mt-2">
                  <Lottie animationData={successAnimation} loop={false} />
                </div>
                <AlertDialogTitle className="text-center">
                  Tu suscripción ha sido cancelada
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-gray-600">
                  Lamentamos verte partir, pero siempre puedes volver
                  {formattedExpirationDate && (
                    <p className="mt-2">Tu plan sigue activo hasta {formattedExpirationDate}</p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col space-y-0 mt-4">
                <Button
                  onClick={() => {
                    handleClose()
                    router.push('/my-store')
                  }}
                >
                  Volver a mi cuenta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose()
                    router.push('/pricing')
                  }}
                >
                  Explorar otros planes
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    handleClose()
                    router.push('/feedback')
                  }}
                >
                  Déjanos tu opinión
                </Button>
              </AlertDialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  )
}
