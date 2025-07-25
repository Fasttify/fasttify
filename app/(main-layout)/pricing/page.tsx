'use client';

import outputs from '@/amplify_outputs.json';
import { Footer } from '@/app/(main-layout)/landing/components/Footer';
import { faqItems } from '@/app/(main-layout)/pricing/components/FAQItem';
import { FAQSection } from '@/app/(main-layout)/pricing/components/FAQSection';
import { FeatureComparison } from '@/app/(main-layout)/pricing/components/FeatureComparison';
import { plans } from '@/app/(main-layout)/pricing/components/plans';
import { PricingCard } from '@/app/(main-layout)/pricing/components/PricingCard';
import { Amplify } from 'aws-amplify';
import { motion } from 'framer-motion';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export default function PricingPage() {
  return (
    <>
      <div className="min-h-screen p-8 md:mt-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <h1 className="font-normal text-4xl md:text-5xl lg:text-6xl text-center mb-8 text-black">
              Nuestros precios
            </h1>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          <FeatureComparison />
        </div>
      </div>
      <FAQSection items={faqItems} />
      <Footer />
    </>
  );
}
