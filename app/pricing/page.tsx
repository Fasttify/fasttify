'use client'

import { useEffect } from 'react'
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
    REST: outputs.custom.APIs,
  },
})

const plans = [
  {
    name: 'Royal',
    title: '$20.000 COP/mes',
    price: '20000',
    description: 'Ideal para emprendedores individuales.',
    features: [
      'Asesoría por chat, email y WhatsApp.',
      'Hosting y SSL gratuitos.',
      'Venta en múltiples idiomas y moneda local.',
      'Panel de estadísticas básicas.',
      'Seguimiento de productos para vendedores y compradores.',
      'Optimización de precios con IA (básico).',
      'Hasta 5 plantillas para personalizar la tienda.',
    ],
    buttonText: 'Suscribirse ahora',
    className: 'bg-white',
  },
  {
    name: 'Majestic',
    title: '$30.000 COP/mes',
    price: '30000',
    description: 'Para equipos pequeños que quieren crecer.',
    features: [
      'Todo en Royal.',
      'Panel de estadísticas avanzadas.',
      'Gestión de múltiples vendedores.',
      'Automatización de respuestas a clientes.',
      'Personalización avanzada con Strapi.',
      'Soporte prioritario 24/7.',
      'Integraciones con redes sociales.',
    ],
    buttonText: 'Suscribirse ahora',
    className: 'bg-white',
    popular: true,
  },
  {
    name: 'Imperial',
    title: '$45.000 COP/mes',
    price: '45000',
    description: 'Para negocios en expansión con alto tráfico.',
    features: [
      'Todo en Majestic.',
      'Membresías y descuentos exclusivos para clientes.',
      'Almacenamiento y carga de productos sin límite.',
      'Gestión avanzada de pedidos y envíos.',
      'Marca blanca para personalización total.',
      'API para conectar con otros servicios.',
      'Analítica y reportes personalizados.',
      'Atención VIP con gestor de cuenta dedicado.',
    ],
    buttonText: 'Suscribirse ahora',
    className: 'bg-white',
  },
]

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Planes y Pagos • Fasttify'
  }, [])

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8">
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
              <PricingCard key={plan.name} plan={plan} />
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
