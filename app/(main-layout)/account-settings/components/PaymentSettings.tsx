import { useState } from 'react'
import { post } from 'aws-amplify/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Amplify } from 'aws-amplify'
import useUserStore from '@/context/core/userStore'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export function PaymentSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUserStore()

  const cognitoUsername = user?.userId
  const userEmail = user?.email
  const userName = user?.nickName

  const handleRedirectToPolarsh = async () => {
    if (!cognitoUsername || !userEmail || !userName) {
      console.error('User information is incomplete.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await post({
        apiName: 'SubscriptionApi',
        path: 'subscribe',
        options: {
          body: {
            userId: cognitoUsername,
            email: userEmail,
            name: userName,
          },
        },
      })
      const { body } = await response.response
      const responseUrl = (await body.json()) as { checkoutUrl?: string }
      if (responseUrl && responseUrl.checkoutUrl) {
        window.location.href = responseUrl.checkoutUrl
      } else {
        console.warn('No checkout URL received.')
      }
    } catch (error) {
      console.error('Error redirecting to Polarsh:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 px-4 pt-4 pb-4 min-h-screen flex flex-col justify-start">
      <div>
        <h2 className="text-2xl font-bold">Suscripción</h2>
        <p className="text-gray-500 mt-2">
          Gestiona tu plan de suscripción directamente en Polarsh.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Gestionar Suscripción
          </CardTitle>
          <CardDescription className="text-gray-600">
            Haz clic para ser redirigido al panel de Polarsh y administrar tu plan.
          </CardDescription>
        </CardHeader>
        <div className="p-6 flex justify-end">
          <Button onClick={handleRedirectToPolarsh} disabled={isSubmitting}>
            {isSubmitting ? 'Redirigiendo...' : 'Ir al panel de suscripción'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
