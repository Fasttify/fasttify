import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { routes } from '@/utils/routes'

interface CollectionsHeaderProps {
  storeId: string
}

export default function CollectionsHeader({ storeId }: CollectionsHeaderProps) {
  const router = useRouter()
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-medium text-gray-800">Colecciones</h1>
        <p className="text-gray-600 mt-1">
          Organiza tus productos en colecciones para facilitar la navegación de tus clientes.
        </p>
      </div>
      <Button
        size="sm"
        className="h-9 bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] text-xs sm:text-sm"
        onClick={() => router.push(routes.store.collectionsNew(storeId))}
      >
        Crear colección
      </Button>
    </div>
  )
}
