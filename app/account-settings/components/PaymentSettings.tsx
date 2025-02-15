'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { useSubscriptionStore } from '@/store/useSubscriptionStore'
import { post } from 'aws-amplify/api'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { SubscriptionCard } from '@/app/account-settings/components/SubscriptionCard'
import Lottie from 'lottie-react'
import cancelAnimation from '@/app/account-settings/anim/cancel-animation.json'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export function PaymentSettings() {
  const { subscription, loading, error } = useSubscriptionStore()
  const { userData } = useAuthUser()
  const [cachedSubscription, setCachedSubscription] = useState(subscription)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  useEffect(() => {
    if (!loading && subscription) {
      setCachedSubscription(subscription)
    }
  }, [loading, subscription])

  const currentSubscription = loading ? cachedSubscription : subscription

  const cognitoUsername =
    userData && userData['cognito:username'] ? userData['cognito:username'] : null

  const handleCancel = async () => {
    if (!cognitoUsername) {
      console.error('No hay usuario autenticado.')
      return
    }
    if (!currentSubscription || !currentSubscription.subscriptionId) {
      console.error('No se encontró una suscripción activa.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await post({
        apiName: 'SubscriptionApi',
        path: 'cancel-plan',
        options: {
          body: {
            user_id: cognitoUsername,
            preapproval_id: currentSubscription.subscriptionId,
          },
        },
      })
      console.log('Suscripción cancelada exitosamente')
      // You might want to update the subscription state here
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error)
    } finally {
      setIsSubmitting(false)
      setShowCancelDialog(false)
    }
  }

  const handleUpdatePlan = async ({
    newAmount,
    currencyId,
    newPlanName,
    subscriptionId,
  }: {
    newAmount: number
    currencyId: string
    newPlanName: string
    subscriptionId: string
  }) => {
    if (!cognitoUsername) {
      console.error('No hay usuario autenticado.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await post({
        apiName: 'SubscriptionApi',
        path: 'plan-management',
        options: {
          body: {
            subscriptionId,
            newAmount,
            currencyId,
            newPlanName,
          },
        },
      })
      const { body } = await response.response
      const responseUrl = (await body.json()) as { confirmationUrl?: string }
      if (responseUrl && responseUrl.confirmationUrl) {
        window.location.href = responseUrl.confirmationUrl
      } else {
        console.warn('No se recibió URL de confirmación.')
      }
    } catch (error) {
      console.error('Error al actualizar el plan:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 px-4 pt-4 pb-4 min-h-screen flex flex-col justify-start">
      <div>
        <h2 className="text-2xl font-bold">Suscripción</h2>
        <p className="text-gray-500 mt-2">Gestiona tu plan de suscripción y método de pago</p>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Cargando información de suscripción...</CardTitle>
          </CardHeader>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar la suscripción</CardTitle>
            <CardDescription>Por favor, intenta de nuevo más tarde.</CardDescription>
          </CardHeader>
        </Card>
      ) : !currentSubscription || !currentSubscription.nextPaymentDate ? (
        <Card>
          <CardHeader>
            <CardTitle>No tienes una suscripción activa</CardTitle>
            <CardDescription>
              Explora nuestros planes y elige el que mejor se adapte a tus necesidades.
            </CardDescription>
          </CardHeader>
          <div className="p-6">
            <Link href="/pricing">
              <Button variant="outline">Ver planes disponibles</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <SubscriptionCard
            subscription={{
              planName: currentSubscription.planName,
              nextPaymentDate: currentSubscription.nextPaymentDate,
              subscriptionId: currentSubscription.subscriptionId,
              memberSince: currentSubscription.createdAt,
              cardLastFourDigits: currentSubscription.lastFourDigits ?? 0,
              pendingPlan: currentSubscription.pendingPlan ?? '',
            }}
            memberSince={currentSubscription.createdAt}
            onUpdatePlan={handleUpdatePlan}
            isSubmitting={isSubmitting}
          />

          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isSubmitting || subscription?.pendingPlan === 'free'}
                className="w-auto self-start text-red-500 hover:text-red-500"
              >
                Cancelar Suscripción
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
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
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Cancelación'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
