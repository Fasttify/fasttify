import { ArrowLeft, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { plans } from '@/app/(with-navbar)/pricing/components/plans'
import { FAQSection } from '@/app/(with-navbar)/pricing/components/FAQSection'
import { faqItems } from '@/app/(with-navbar)/pricing/components/FAQItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Amplify } from 'aws-amplify'
import { post } from 'aws-amplify/api'
import useUserStore from '@/zustand-states/userStore'
import outputs from '@/amplify_outputs.json'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { useToast } from '@/hooks/custom-toast/use-toast'
import { Toast } from '@/components/ui/toasts'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

interface PricingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingDrawer({ open, onOpenChange }: PricingDrawerProps) {
  const { user } = useUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] max-h-[95vh]">
          {isClient && isSubmitting && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
              <LoadingIndicator text="Procesando suscripción..." />
            </div>
          )}
          <DrawerHeader className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </DrawerClose>
              <DrawerTitle className="text-lg font-medium">Elige tu plan</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <ScrollArea className="h-[calc(95vh-64px)]">
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                {plans.map(plan => (
                  <PlanCard
                    key={plan.name}
                    title={plan.name}
                    description={plan.description}
                    price={plan.price}
                    features={plan.features}
                    buttonText={plan.buttonText}
                    isPopular={plan.popular}
                    user={user}
                    setIsSubmitting={setIsSubmitting}
                    addToast={addToast as (message: string, type: string) => void}
                    isClient={isClient}
                  />
                ))}
              </div>
            </div>
            {/* FAQ Section */}
            <FAQSection
              items={faqItems}
              title="Preguntas frecuentes"
              subtitle="¿Tienes dudas sobre nuestros planes? Aquí encontrarás respuestas."
            />
            <div className="h-4"></div> {/* Add some bottom padding */}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {isClient && <Toast toasts={toasts} removeToast={removeToast} />}
    </>
  )
}

interface PlanCardProps {
  title: string
  description: string
  price: string
  features: string[]
  buttonText: string
  isPopular?: boolean
  user: any
  setIsSubmitting: (value: boolean) => void
  addToast: (message: string, type: string) => void
  isClient: boolean
}

function PlanCard({
  title,
  description,
  price,
  features,
  buttonText,
  isPopular = false,
  user,
  setIsSubmitting,
  addToast,
  isClient,
}: PlanCardProps) {
  const router = useRouter()
  // Format price with thousand separator
  const formattedPrice = parseInt(price).toLocaleString('es-CO')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const cognitoUsername = user?.cognitoUsername
  const hasActivePlan = user && user.plan ? user.plan === title : false

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsButtonDisabled(true)
    setIsSubmitting(true)
    try {
      const restOperation = post({
        apiName: 'SubscriptionApi',
        path: 'subscribe',
        options: {
          body: {
            userId: cognitoUsername || '',
            plan: {
              name: title,
              price: price,
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
      setIsButtonDisabled(false)
    }
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm relative">
      {isPopular && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-32 rounded-full bg-blue-100 py-1 text-center text-sm text-blue-700 font-medium">
          Más popular
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-600">Desde</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${formattedPrice}</span>
            <span className="ml-1 text-sm text-muted-foreground">COP/mes</span>
          </div>
        </div>
        <Button
          className={`mt-5 w-full ${
            hasActivePlan || isButtonDisabled
              ? 'bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
          onClick={handleSubscribe}
          disabled={!isClient || hasActivePlan || isButtonDisabled}
        >
          {hasActivePlan ? 'Plan activo' : isButtonDisabled ? 'Procesando...' : buttonText}
        </Button>
      </div>

      <div className="border-t px-6 py-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 py-2">
            <Check className="h-4 w-4 mt-0.5 text-zinc-900" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
