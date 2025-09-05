'use client';

import { ProductManager } from '@/app/store/components/product-management/products/pages/ProductManager';
import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname } from 'next/navigation';

export default function ProductsClient() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  return <ProductManager storeId={storeId} />;
}
