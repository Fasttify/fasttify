'use client'

import { InventoryTracking } from '@/app/store/components/product-management/InventoryTracking'
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

export default function InventoryPage() {
  return <InventoryTracking />
}
