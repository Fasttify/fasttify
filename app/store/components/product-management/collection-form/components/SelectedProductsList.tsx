import { Button } from '@/components/ui/button'
import { IProduct } from '@/app/store/components/product-management/collection-form/types/productTypes'
import { ProductItem } from '@/app/store/components/product-management/collection-form/components/ProductItem'

interface SelectedProductsListProps {
  selectedProducts: IProduct[]
  onRemoveProduct: (productId: string) => void
  onOpenDialog: () => void
}

export function SelectedProductsList({
  selectedProducts,
  onRemoveProduct,
  onOpenDialog,
}: SelectedProductsListProps) {
  if (selectedProducts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay productos seleccionados</p>
        <Button variant="outline" className="mt-2" onClick={onOpenDialog}>
          Añadir productos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {selectedProducts.map((product, index) => (
        <ProductItem key={product.id} product={product} index={index} onRemove={onRemoveProduct} />
      ))}
    </div>
  )
}
