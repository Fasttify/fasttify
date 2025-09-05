'use client';

import { PageManager } from '@/app/store/components/page-management';
import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname } from 'next/navigation';

export default function NewPageClient() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  return <PageManager isCreating storeId={storeId} />;
}
