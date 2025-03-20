import { SortAsc, SortDesc, Edit, Trash, Image } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatInventory } from '@/app/store/components/product-management/utils/product-utils'
import type { IProduct } from '@/app/store/hooks/useProducts'
import type {
  SortField,
  VisibleColumns,
} from '@/app/store/components/product-management/types/product-types'

interface ProductTableDesktopProps {
  products: IProduct[]
  selectedProducts: string[]
  handleSelectAll: () => void
  handleSelectProduct: (id: string) => void
  handleEditProduct: (id: string) => void
  handleDeleteProduct: (id: string) => void
  visibleColumns: VisibleColumns
  toggleSort: (field: SortField) => void
  renderSortIndicator: (field: SortField) => 'asc' | 'desc' | null
}

export function ProductTableDesktop({
  products,
  selectedProducts,
  handleSelectAll,
  handleSelectProduct,
  handleEditProduct,
  handleDeleteProduct,
  visibleColumns,
  toggleSort,
  renderSortIndicator,
}: ProductTableDesktopProps) {
  return (
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedProducts.length === products.length && products.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all products"
              />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
              Producto{' '}
              {renderSortIndicator('name') === 'asc' ? (
                <SortAsc className="ml-1 h-4 w-4 inline" />
              ) : renderSortIndicator('name') === 'desc' ? (
                <SortDesc className="ml-1 h-4 w-4 inline" />
              ) : null}
            </TableHead>
            {visibleColumns.status && (
              <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                Estado{' '}
                {renderSortIndicator('status') === 'asc' ? (
                  <SortAsc className="ml-1 h-4 w-4 inline" />
                ) : renderSortIndicator('status') === 'desc' ? (
                  <SortDesc className="ml-1 h-4 w-4 inline" />
                ) : null}
              </TableHead>
            )}
            {visibleColumns.inventory && (
              <TableHead className="cursor-pointer" onClick={() => toggleSort('quantity')}>
                Inventario{' '}
                {renderSortIndicator('quantity') === 'asc' ? (
                  <SortAsc className="ml-1 h-4 w-4 inline" />
                ) : renderSortIndicator('quantity') === 'desc' ? (
                  <SortDesc className="ml-1 h-4 w-4 inline" />
                ) : null}
              </TableHead>
            )}
            {visibleColumns.price && (
              <TableHead className="cursor-pointer" onClick={() => toggleSort('price')}>
                Precio{' '}
                {renderSortIndicator('price') === 'asc' ? (
                  <SortAsc className="ml-1 h-4 w-4 inline" />
                ) : renderSortIndicator('price') === 'desc' ? (
                  <SortDesc className="ml-1 h-4 w-4 inline" />
                ) : null}
              </TableHead>
            )}
            {visibleColumns.category && (
              <TableHead className="cursor-pointer" onClick={() => toggleSort('category')}>
                Categoría{' '}
                {renderSortIndicator('category') === 'asc' ? (
                  <SortAsc className="ml-1 h-4 w-4 inline" />
                ) : renderSortIndicator('category') === 'desc' ? (
                  <SortDesc className="ml-1 h-4 w-4 inline" />
                ) : null}
              </TableHead>
            )}
            {visibleColumns.actions && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => handleSelectProduct(product.id)}
                  aria-label={`Select ${product.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {product.images &&
                  (Array.isArray(product.images)
                    ? product.images.length > 0
                    : typeof product.images === 'string' &&
                      product.images !== '[]' &&
                      product.images !== '') ? (
                    <img
                      src={
                        typeof product.images === 'string'
                          ? JSON.parse(product.images)[0]?.url
                          : product.images[0]?.url
                      }
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Image className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <span className="font-medium">{product.name}</span>
                </div>
              </TableCell>
              {visibleColumns.status && (
                <TableCell>
                  {product.status === 'active' && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
                      Activo
                    </Badge>
                  )}
                  {product.status === 'draft' && <Badge variant="outline">Borrador</Badge>}
                  {product.status === 'inactive' && <Badge variant="secondary">Archivado</Badge>}
                  {product.status === 'pending' && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ">
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
              )}
              {visibleColumns.inventory && (
                <TableCell>{formatInventory(product.quantity)}</TableCell>
              )}
              {visibleColumns.price && (
                <TableCell>
                  {product.price !== null && product.price !== undefined
                    ? `$${product.price.toFixed(2)}`
                    : '$0.00'}
                </TableCell>
              )}
              {visibleColumns.category && (
                <TableCell>{product.category || 'Sin categoría'}</TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
