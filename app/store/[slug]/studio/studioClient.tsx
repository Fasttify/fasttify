'use client';

import { useParams, usePathname } from 'next/navigation';
import { getStoreId } from '@/utils/client/store-utils';
import { ThemeStudio } from '@fasttify/theme-studio';
import { useMemo } from 'react';
import { useStore } from '@/app/store/hooks/data/useStore/useStore';
import { Loading } from '@shopify/polaris';

export default function StudioClient() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  const { store: currentStore, loading } = useStore(storeId);

  const domain = useMemo(() => {
    if (!currentStore) return null;
    return currentStore.defaultDomain || null;
  }, [currentStore]);

  if (loading || !domain) {
    return <Loading />;
  }

  return <ThemeStudio storeId={storeId} apiBaseUrl="/api" domain={domain} />;
}
