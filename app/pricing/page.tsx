'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PricingCard } from '@/app/pricing/components/PricingCard'
import { Footer } from '@/app/landing/components/Footer'
import { Navbar } from '@/app/landing/components/NavBar'
import { FAQSection } from '@/app/pricing/components/FAQSection'
import { faqItems } from '@/app/pricing/components/FAQItem'
import { Amplify } from 'aws-amplify'
import { FeatureComparison } from '@/app/pricing/components/FeatureComparison'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.API,
  },
})

const plans = [
  {
    name: 'Royal',
    title: '$20000',
    price: '20000',
    description: 'Para emprendedores individuales',
    features: [
      'Contacto con un asesor vía chat, Messenger, email o WhatsApp.',
      'Hosting y SSL gratis.',
      'Acceso a múltiples idiomas y moneda local.',
      'Panel de estadísticas básicas.',
      'Seguimiento de productos para vendedores y compradores.',
      'Optimización de precios básica.',
      'Hasta 5 plantillas para personalizar la página.',
    ],
    buttonText: 'Prueba gratis',
    className: 'bg-white',
  },
  {
    name: 'Majestic',
    title: '$30000',
    price: '30000',
    description: 'Para equipos pequeños',
    features: [
      'Everything in Simple',
      '512GB of business storage',
      'Unlimited management',
      'Unlimited collaborators',
      'Links with password protection',
    ],
    buttonText: 'Prueba gratis',
    className: 'bg-white',
    popular: true,
  },
  {
    name: 'Imperial',
    title: '$45000',
    price: '45000',
    description: 'A medida que tu negocio escala',
    features: [
      'Everything in Efficient',
      'Unlimited team members',
      'Custom storage plans',
      'White label branding',
    ],
    buttonText: 'Prueba gratis',
    className: 'bg-white',
  },
]

export default function PricingPage() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Planes y Pagos • Fasttify'
  }, [])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-normal text-4xl md:text-5xl lg:text-6xl text-center mb-8 text-black">
              Nuestros precios
            </h1>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {plans.map(plan => (
              <PricingCard
                key={plan.name}
                plan={plan}
                hoveredPlan={hoveredPlan}
                onHover={setHoveredPlan}
              />
            ))}
          </div>

          <FeatureComparison />
        </div>
      </div>
      <FAQSection items={faqItems} />
      <Footer />
    </>
  )
}
