'use client';
import { CheckoutManager } from '@/app/store/components/checkouts';
import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname } from 'next/navigation';

export default function CheckoutsPage() {
  const params = useParams();
  const pathname = usePathname();

  const storeId = getStoreId(params, pathname);

  return <CheckoutManager storeId={storeId} />;
}
