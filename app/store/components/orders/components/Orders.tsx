'use client';

import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname } from 'next/navigation';
import { OrderManager } from '../pages/OrderManager';

export function Orders() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  if (!storeId) {
    return (
      <div className="w-full mt-8">
        <div className="text-center">
          <p>Error: No se pudo obtener el ID de la tienda</p>
        </div>
      </div>
    );
  }

  return <OrderManager storeId={storeId} />;
}
