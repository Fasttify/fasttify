'use client'

import { InventoryManager } from '@/app/store/components/product-management/main-components/InventoryManager'
import { configureAmplify } from '@/lib/amplify-config'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'

configureAmplify()

export default function InventoryPage() {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  return <InventoryManager storeId={storeId} />
}
