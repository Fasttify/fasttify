'use client';

import { useParams, usePathname } from 'next/navigation';
import { getStoreId } from '@/utils/client/store-utils';
import { ThemeStudio } from '@fasttify/theme-studio';

export default function StudioClient() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  return <ThemeStudio storeId={storeId} apiBaseUrl="/api" />;
}
