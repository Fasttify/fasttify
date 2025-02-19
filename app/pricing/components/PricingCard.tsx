'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { post } from 'aws-amplify/api'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/custom-toast/use-toast'
import { Toast } from '@/components/ui/toasts'
import { useAuth } from '@/hooks/auth/useAuth'
import useUserStore from '@/store/userStore'

interface PricingCardProps {
  plan: {
    name: string
    title: string
    price: string
    description: string
    features: string[]
    buttonText: string
    className: string
    popular?: boolean
  }
}

export function PricingCard({ plan }: PricingCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { userData } = useAuthUser()
  const { user } = useUserStore()
  const { loading } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const router = useRouter()

  const cognitoUsername =
    userData && userData['cognito:username'] ? userData['cognito:username'] : null

  const hasActivePlan = user && user.plan ? user.plan === plan.name : false

  const formatPrice = (price: string) => {
    if (price === '0') return 'Gratis'
    const numPrice = Number.parseInt(price, 10)
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice)

    return `$ ${formattedPrice}`
  }

  const handleSubscribe = async () => {
    if (!userData) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    try {
      const restOperation = post({
        apiName: 'SubscriptionApi',
        path: 'subscribe',
        options: {
          body: {
            userId: cognitoUsername,
            plan: {
              name: plan.name,
              price: plan.price,
            },
          },
        },
      })

      const { body } = await restOperation.response
      const response: any = await body.json()

      window.location.href = response.checkoutUrl
    } catch (error) {
      console.error('Error al suscribirse:', error)
      addToast('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.', 'error')
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isSubmitting) {
        setIsSubmitting(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSubmitting])

  if (loading) {
    return <LoadingIndicator text="Cargando planes..." />
  }

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
          <LoadingIndicator text="Procesando suscripción..." />
        </div>
      )}

      <motion.div
        className="relative rounded-2xl bg-white shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {plan.popular && (
          <div className="absolute -top-3 left-0 right-0">
            <div className="mx-auto w-fit rounded-full bg-primary px-4 py-1 text-center text-sm font-medium text-white shadow-md">
              Más popular
            </div>
          </div>
        )}
        <div className="p-8 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
              <span className="ml-2 text-sm text-gray-600">COP al mes</span>
              <p className="mt-1 text-sm text-gray-500">facturación mensual</p>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Funciones destacadas</h4>
            <ul className="space-y-3">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            className={`w-full rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 ${
              hasActivePlan
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            onClick={handleSubscribe}
            disabled={isSubmitting || hasActivePlan || user?.plan !== 'free'}
          >
            {hasActivePlan ? 'Plan activo' : isSubmitting ? 'Procesando...' : plan.buttonText}
          </Button>
        </div>
      </motion.div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}
