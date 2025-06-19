import { Suspense } from 'react'
import { NavigationManager } from '@/app/store/components/navigation-management'

interface NavigationPageProps {
  params: {
    slug: string
  }
}

/**
 * Página principal de gestión de navegación
 */
export default async function NavigationPage({ params }: NavigationPageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<div>Cargando gestión de navegación...</div>}>
      <NavigationManager storeId={slug} />
    </Suspense>
  )
}
