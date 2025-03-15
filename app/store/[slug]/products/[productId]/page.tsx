'use client'

import { ProductForm } from '@/app/store/components/product-management/ProductForm'
import { useParams, usePathname } from 'next/navigation'
import { getStoreId } from '@/utils/store-utils'

export default function EditProductPage() {
  const params = useParams()
  const pathname = usePathname()

  const storeId = getStoreId(params, pathname)
  const productId = params.productId as string

  return <ProductForm storeId={storeId} productId={productId} />
}
