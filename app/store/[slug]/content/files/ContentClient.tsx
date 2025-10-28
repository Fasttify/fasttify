'use client';

import { ContentManager } from '@/app/store/components/content';
import { Suspense } from 'react';

interface ContentClientProps {
  storeId: string;
}

export default function ContentClient({ storeId }: ContentClientProps) {
  return (
    <Suspense>
      <ContentManager storeId={storeId} />
    </Suspense>
  );
}
