'use client'

import { useState } from 'react'
import '@shopify/polaris/build/esm/styles.css'
import { AppProvider } from '@shopify/polaris'
import esTranslations from '@shopify/polaris/locales/es.json'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { useStore } from '@/app/store/hooks/data/useStore'
import { PolarisLayout } from '@/app/store/components/sidebar/components/polaris-layout'
import { Amplify } from 'aws-amplify'
import { ToastProvider } from '@/app/store/context/ToastContext'

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

export const StoreLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  useStore(storeId)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  return (
    <AppProvider i18n={esTranslations}>
      <ToastProvider>
        <PolarisLayout storeId={storeId} prefersReducedMotion={prefersReducedMotion}>
          {children}
        </PolarisLayout>
      </ToastProvider>
    </AppProvider>
  )
}
