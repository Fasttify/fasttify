'use client'

import { EcommerceSetup } from '@/app/store/components/store-setup/components/EcommerceSetup'
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

export default function DashboardPage() {
  return <EcommerceSetup />
}
