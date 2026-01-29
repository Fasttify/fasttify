'use client';

import { InventoryManager } from '@/app/store/components/product-management/inventory/pages/InventoryManager';
import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname } from 'next/navigation';

export default function InventoryClient() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  return <InventoryManager storeId={storeId} />;
}
