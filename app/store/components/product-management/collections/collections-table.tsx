import { Checkbox } from '@/components/ui/checkbox'
import { FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { routes } from '@/utils/routes'

// Definir la interfaz para las props
interface CollectionsTableProps {
  collections: any[]
  storeId: string
}

export default function CollectionsTable({ collections, storeId }: CollectionsTableProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="font-medium text-gray-600">Título</TableHead>
            <TableHead className="font-medium text-gray-600">Productos</TableHead>
            <TableHead className="font-medium text-gray-600">Condiciones del producto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                No hay colecciones disponibles
              </TableCell>
            </TableRow>
          ) : (
            collections.map(collection => (
              <TableRow key={collection.id}>
                <TableCell className="p-4">
                  <Checkbox />
                </TableCell>

                <TableCell className="p-4">
                  <Link
                    href={`/store/${storeId}/collections/${collection.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span>{collection.title || 'Sin título'}</span>
                  </Link>
                </TableCell>
                <TableCell className="p-4">{collection.products?.length || 0}</TableCell>
                <TableCell className="p-4">
                  {collection.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      Borrador
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
