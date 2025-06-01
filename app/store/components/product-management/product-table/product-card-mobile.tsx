import { Image, Edit, Trash } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatInventory } from '@/app/store/components/product-management/utils/product-utils'
import type { IProduct } from '@/app/store/hooks/useProducts'
import type { VisibleColumns } from '@/app/store/components/product-management/types/product-types'

interface ProductCardMobileProps {
  products: IProduct[]
  selectedProducts: string[]
  handleSelectProduct: (id: string) => void
  handleEditProduct: (id: string) => void
  handleDeleteProduct: (id: string) => void
  visibleColumns: VisibleColumns
}

export function ProductCardMobile({
  products,
  selectedProducts,
  handleSelectProduct,
  handleEditProduct,
  handleDeleteProduct,
  visibleColumns,
}: ProductCardMobileProps) {
  return (
    <div className="sm:hidden">
      {products.map(product => (
        <div key={product.id} className="border-b p-4">
          <div className="flex justify-between items-start mb-3">
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
                      : Array.isArray(product.images)
                        ? product.images[0]?.url
                        : undefined
                  }
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <Image className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{product.name}</h3>
                {visibleColumns.category && (
                  <p className="text-sm text-muted-foreground">
                    {product.category || 'Sin categoría'}
                  </p>
                )}
              </div>
            </div>
            <Checkbox
              checked={selectedProducts.includes(product.id)}
              onCheckedChange={() => handleSelectProduct(product.id)}
              aria-label={`Select ${product.name}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {visibleColumns.status && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
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
              </div>
            )}
            {visibleColumns.price && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Precio</p>
                <p>
                  {product.price !== null && product.price !== undefined
                    ? `$${Number(product.price).toLocaleString('es-CO', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : '$0'}
                </p>
              </div>
            )}
            {visibleColumns.inventory && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Inventario</p>
                <p>{formatInventory(product.quantity ?? 0)}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => handleEditProduct(product.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => handleDeleteProduct(product.id)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
