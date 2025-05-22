'use client'

import { ProductManager } from '@/app/store/components/product-management/main-components/ProductManager'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
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

export default function StoreProductsPage() {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  return <ProductManager storeId={storeId} />
}
