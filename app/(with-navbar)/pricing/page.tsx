'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PricingCard } from '@/app/(with-navbar)/pricing/components/PricingCard'
import { Footer } from '@/app/(with-navbar)/landing/components/Footer'
import { FAQSection } from '@/app/(with-navbar)/pricing/components/FAQSection'
import { faqItems } from '@/app/(with-navbar)/pricing/components/FAQItem'
import { Amplify } from 'aws-amplify'
import { FeatureComparison } from '@/app/(with-navbar)/pricing/components/FeatureComparison'
import outputs from '@/amplify_outputs.json'
import { plans } from '@/app/(with-navbar)/pricing/components/plans'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Planes y Pagos • Fasttify'
  }, [])

  return (
    <>
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
