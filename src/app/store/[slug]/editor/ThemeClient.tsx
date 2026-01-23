'use client';

import { useParams, usePathname } from 'next/navigation';
import { getStoreId } from '@/utils/client/store-utils';
import ThemeEditorCode from '@/app/store/components/editor/pages/ThemeEditor';

export default function ThemeEditorPage() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  return <ThemeEditorCode storeId={storeId} />;
}
