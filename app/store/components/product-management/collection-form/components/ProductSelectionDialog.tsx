import { Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchInput } from '@/app/store/components/product-management/collection-form/search-input'
import { IProduct } from '@/app/store/components/product-management/collection-form/types/productTypes'
import {
  getProductImageUrl,
  formatPrice,
} from '@/app/store/components/product-management/collection-form/utils/productUtils'

interface ProductSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  products: IProduct[]
  selectedProductIds: string[]
  onProductSelect: (productId: string) => void
  onConfirm: () => void
  loading: boolean
}

export function ProductSelectionDialog({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  products,
  selectedProductIds,
  onProductSelect,
  onConfirm,
  loading,
}: ProductSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar productos</DialogTitle>
        </DialogHeader>

        <div className="relative my-4">
          <SearchInput
            placeholder="Buscar productos"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-4 text-center">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="py-4 text-center">No se encontraron productos</div>
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {products.map(product => (
              <ProductDialogItem
                key={product.id}
                product={product}
                isSelected={selectedProductIds.includes(product.id)}
                onSelect={() => onProductSelect(product.id)}
              />
            ))}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
            onClick={onConfirm}
            disabled={loading}
          >
            Confirmar selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductDialogItemProps {
  product: IProduct
  isSelected: boolean
  onSelect: () => void
}

function ProductDialogItem({ product, isSelected, onSelect }: ProductDialogItemProps) {
  const imageUrl = getProductImageUrl(product)

  return (
    <div className="flex items-center py-2 border-b">
      <Checkbox
        id={`product-${product.id}`}
        checked={isSelected}
        onCheckedChange={onSelect}
        className="mr-2"
      />

      <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-2">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      <label htmlFor={`product-${product.id}`} className="text-sm flex-grow cursor-pointer">
        {product.name}
        <div className="text-xs text-gray-500">{formatPrice(product.price)}</div>
      </label>
    </div>
  )
}
