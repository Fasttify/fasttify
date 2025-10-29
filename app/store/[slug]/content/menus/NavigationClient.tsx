import { NavigationManager } from '@/app/store/components/navigation-management';
import { Suspense } from 'react';

interface NavigationClientProps {
  storeId: string;
}

export default function NavigationClient({ storeId }: NavigationClientProps) {
  return (
    <Suspense>
      <NavigationManager storeId={storeId} />
    </Suspense>
  );
}
