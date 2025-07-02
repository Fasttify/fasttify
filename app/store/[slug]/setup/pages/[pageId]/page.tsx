'use client';

import { PageManager } from '@/app/store/components/page-management';
import { getStoreId } from '@/utils/store-utils';
import { useParams, usePathname } from 'next/navigation';

export default function EditPagePage() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);
  const pageId = params.pageId as string;

  return <PageManager pageId={pageId} storeId={storeId} />;
}
