import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader } from '@/components/ui/loader'

// Cargar dinámicamente componentes que usan APIs REST
const CollectionsPageContent = dynamic(() => import('./CollectionsPageContent'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader color="black" text="Cargando colecciones..." size="large" />
    </div>
  ),
  ssr: false, // Deshabilitar SSR para componentes que usan APIs
})

export function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader color="black" text="Inicializando..." size="large" />
        </div>
      }
    >
      <CollectionsPageContent />
    </Suspense>
  )
}
