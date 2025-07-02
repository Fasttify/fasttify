import { NavigationManager } from '@/app/store/components/navigation-management';
import { Suspense } from 'react';

interface NavigationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Página principal de gestión de navegación
 */
export default async function NavigationPage({ params }: NavigationPageProps) {
  const { slug } = await params;
  return (
    <Suspense>
      <NavigationManager storeId={slug} />
    </Suspense>
  );
}
