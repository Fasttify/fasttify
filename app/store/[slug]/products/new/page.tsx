'use client'

import { ProductForm } from '@/app/store/components/product-management/main-components/ProductForm'
import { useParams, usePathname } from 'next/navigation'
import { getStoreId } from '@/utils/store-utils'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()
export default function AddProductPage() {
  const params = useParams()
  const pathname = usePathname()

  const storeId = getStoreId(params, pathname)
  return <ProductForm storeId={storeId} />
}
