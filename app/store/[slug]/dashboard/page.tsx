'use client'

import { EcommerceSetup } from '@/app/store/components/store-setup/components/EcommerceSetup'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function DashboardPage() {
  return <EcommerceSetup />
}
