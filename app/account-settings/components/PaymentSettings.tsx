'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSubscriptionStore } from '@/store/useSubscriptionStore'
import { post } from 'aws-amplify/api'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { SubscriptionCard } from '@/app/account-settings/components/SubscriptionCard'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CancellationDialog } from '@/app/account-settings/components/CancellationDialog'
import Link from 'next/link'

export function PaymentSettings() {
  const { subscription, loading, error } = useSubscriptionStore()
  const { userData } = useAuthUser()
  const [cachedSubscription, setCachedSubscription] = useState(subscription)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await post({
        apiName: 'CancelPlanApi',
        path: 'cancel-plan',
        options: {
          body: {
            user_id: cognitoUsername,
            preapproval_id: currentSubscription.subscriptionId,
          },
        },
      })
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error)
    } finally {
      setIsSubmitting(false)
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
      apiName: 'PlanManagementApi',
        path: 'plan-management',
        options: {
          body: {
            cognitoUsername,
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

          <CancellationDialog
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            isPendingFree={subscription?.pendingPlan === 'free'}
            expirationDate={new Date(currentSubscription.nextPaymentDate)}
          />
        </>
      )}
    </div>
  )
}
