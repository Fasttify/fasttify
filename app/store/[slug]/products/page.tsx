'use client'

import { ProductManager } from '@/app/store/components/product-management/ProductManager'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'

export default function StoreProductsPage() {
  const pathname = usePathname()
  const params = useParams()

  const storeId = getStoreId(params, pathname)
  return <ProductManager storeId={storeId} />
}
