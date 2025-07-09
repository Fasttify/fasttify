'use client';

import outputs from '@/amplify_outputs.json';
import { ProductForm } from '@/app/store/components/product-management/products/components/form/ProductForm';
import { getStoreId } from '@/utils/client/store-utils';
import { Amplify } from 'aws-amplify';
import { useParams, usePathname } from 'next/navigation';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export default function AddProductPage() {
  const params = useParams();
  const pathname = usePathname();

  const storeId = getStoreId(params, pathname);
  return <ProductForm storeId={storeId} />;
}
