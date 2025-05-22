'use client'

import { InventoryManager } from '@/app/store/components/product-management/main-components/InventoryManager'
import { Amplify } from 'aws-amplify'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  return <InventoryManager storeId={storeId} />
}
