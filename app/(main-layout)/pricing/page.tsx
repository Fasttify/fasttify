'use client'

import { motion } from 'framer-motion'
import { PricingCard } from '@/app/(main-layout)/pricing/components/PricingCard'
import { Footer } from '@/app/(main-layout)/landing/components/Footer'
import { FAQSection } from '@/app/(main-layout)/pricing/components/FAQSection'
import { faqItems } from '@/app/(main-layout)/pricing/components/FAQItem'
import { FeatureComparison } from '@/app/(main-layout)/pricing/components/FeatureComparison'
import { plans } from '@/app/(main-layout)/pricing/components/plans'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function PricingPage() {
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
