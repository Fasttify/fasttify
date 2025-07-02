'use client';

import { ProductForm } from '@/app/store/components/product-management/products/components/form/ProductForm';
import { useParams, usePathname } from 'next/navigation';
import { getStoreId } from '@/utils/store-utils';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export default function EditProductPage() {
  const params = useParams();
  const pathname = usePathname();

  const storeId = getStoreId(params, pathname);
  const productId = params.productId as string;

  return <ProductForm storeId={storeId} productId={productId} />;
}
