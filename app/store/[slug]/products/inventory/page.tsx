'use client'

import { InventoryManager } from '@/app/store/components/product-management/inventory/pages/InventoryManager'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  return <InventoryManager storeId={storeId} />
}
