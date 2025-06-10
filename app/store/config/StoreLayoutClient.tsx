'use client'

import { useState } from 'react'
import '@shopify/polaris/build/esm/styles.css'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { useStore } from '@/app/store/hooks/useStore'
import { PolarisLayout } from '@/app/store/components/sidebar/components/polaris-layout'
import { Amplify } from 'aws-amplify'

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
    <PolarisLayout storeId={storeId} prefersReducedMotion={prefersReducedMotion}>
      {children}
    </PolarisLayout>
  )
}
