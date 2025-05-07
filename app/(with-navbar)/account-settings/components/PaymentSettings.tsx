import { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSubscriptionStore } from '@/zustand-states/useSubscriptionStore'
import { post } from 'aws-amplify/api'
import { SubscriptionCard } from '@/app/(with-navbar)/account-settings/components/SubscriptionCard'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CancellationDialog } from '@/app/(with-navbar)/account-settings/components/CancellationDialog'
import { Loader } from '@/components/ui/loader'
import useUserStore from '@/zustand-states/userStore'
import Link from 'next/link'

function SubscriptionLoader() {
  const { subscriptionResource } = useSubscriptionStore()
  const subscription = subscriptionResource.read()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUserStore()
  const cognitoUsername = user?.cognitoUsername

  const handleCancel = async () => {
    if (!cognitoUsername) {
      console.error('There is no authenticated user.')
      return
    }
    if (!subscription || !subscription.subscriptionId) {
      console.error('No active subscription found.')
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
            preapproval_id: subscription.subscriptionId,
          },
        },
      })
    } catch (error) {
      console.error('Error unsubscribing:', error)
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
      console.error('There is no authenticated user.')
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
        console.warn('No confirmation URL received.')
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!subscription || !subscription.nextPaymentDate) {
    return (
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
    )
  }

  return (
    <>
      <SubscriptionCard
        subscription={{
          planName: subscription.planName,
          nextPaymentDate: subscription.nextPaymentDate,
          subscriptionId: subscription.subscriptionId,
          memberSince: subscription.createdAt,
          cardLastFourDigits: subscription.lastFourDigits ?? 0,
          pendingPlan: subscription.pendingPlan ?? '',
        }}
        memberSince={subscription.createdAt}
        onUpdatePlan={handleUpdatePlan}
        isSubmitting={isSubmitting}
      />

      <CancellationDialog
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        isPendingFree={subscription?.pendingPlan === 'free'}
        expirationDate={new Date(subscription.nextPaymentDate)}
      />
    </>
  )
}

// Componente de fallback para errores
function ErrorFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error al cargar la suscripción</CardTitle>
        <CardDescription>Por favor, intenta de nuevo más tarde.</CardDescription>
      </CardHeader>
    </Card>
  )
}

// Componente principal
export function PaymentSettings() {
  const { setCognitoUsername } = useSubscriptionStore()
  const { user } = useUserStore()

  // Usar useEffect para inicializar el recurso de suscripción
  useEffect(() => {
    if (user?.cognitoUsername) {
      setCognitoUsername(user.cognitoUsername)
    }
  }, [user?.cognitoUsername, setCognitoUsername])

  return (
    <div className="space-y-8 px-4 pt-4 pb-4 min-h-screen flex flex-col justify-start">
      <div>
        <h2 className="text-2xl font-bold">Suscripción</h2>
        <p className="text-gray-500 mt-2">Gestiona tu plan de suscripción y método de pago</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <Loader
              size="large"
              color="black"
              centered
              text="Cargando suscripción..."
              className="bg-gray-50 p-6 rounded-xl shadow-sm"
            />
          </Card>
        }
      >
        <SubscriptionLoader />
      </Suspense>
    </div>
  )
}
