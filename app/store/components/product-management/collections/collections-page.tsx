import { useState } from 'react'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import CollectionsHeader from '@/app/store/components/product-management/collections/collections-header'
import CollectionsTabs from '@/app/store/components/product-management/collections/collections-tabs'
import CollectionsTable from '@/app/store/components/product-management/collections/collections-table'
import CollectionsFooter from '@/app/store/components/product-management/collections/collections-footer'
import { configureAmplify } from '@/lib/amplify-config'
import { useCollections } from '@/app/store/hooks/useCollections'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

configureAmplify()

type FilterType = 'all' | 'active' | 'inactive'

// Skeleton component for the collections table
function CollectionsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead className="font-medium text-gray-600">
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead className="font-medium text-gray-600">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="font-medium text-gray-600">
              <Skeleton className="h-4 w-32" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <TableRow key={index}>
                <TableCell className="p-4">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell className="p-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function CollectionsPage() {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)

  // Estado para el filtro activo
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // Usar el hook de colecciones
  const { useListCollections } = useCollections()

  // Obtener las colecciones de la tienda
  const { data: collections, isLoading, error } = useListCollections(storeId)

  // Filtrar colecciones según el tab activo y el término de búsqueda
  const filteredCollections = collections?.filter(collection => {
    // Filtrar por estado activo/inactivo
    if (activeFilter === 'all') {
      // No filtrar por estado
    } else if (activeFilter === 'active' && !collection.isActive) {
      return false
    } else if (activeFilter === 'inactive' && collection.isActive) {
      return false
    }

    // Filtrar por término de búsqueda
    if (searchTerm && !collection.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  // Manejar cambio de filtro y búsqueda
  const handleFilterChange = (filter: FilterType, search?: string) => {
    setActiveFilter(filter)
    if (search !== undefined) {
      setSearchTerm(search)
    }
  }

  return (
    <div className="mt-8">
      <CollectionsHeader storeId={storeId} />
      <div className="rounded-lg shadow-sm border mt-4">
        <CollectionsTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        {isLoading ? (
          <CollectionsTableSkeleton />
        ) : error ? (
          <div className="flex justify-center items-center py-20 text-red-500">
            Error al cargar las colecciones. Por favor, intenta de nuevo.
          </div>
        ) : (
          <CollectionsTable collections={filteredCollections || []} storeId={storeId} />
        )}
      </div>
      <CollectionsFooter />
    </div>
  )
}
