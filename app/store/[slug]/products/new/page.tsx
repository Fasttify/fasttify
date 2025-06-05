'use client'

import { ProductForm } from '@/app/store/components/product-management/main-components/ProductForm'
import { useParams, usePathname } from 'next/navigation'
import { getStoreId } from '@/utils/store-utils'
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

export default function AddProductPage() {
  const params = useParams()
  const pathname = usePathname()

  const storeId = getStoreId(params, pathname)
  return <ProductForm storeId={storeId} />
}
