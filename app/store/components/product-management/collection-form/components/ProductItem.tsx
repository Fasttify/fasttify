import { X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductItemProps } from '@/app/store/components/product-management/collection-form/types/productTypes'
import { getProductImageUrl } from '@/app/store/components/product-management/collection-form/utils/productUtils'

export function ProductItem({ product, index, onRemove }: ProductItemProps) {
  const imageUrl = getProductImageUrl(product)

  return (
    <div className="flex items-center border border-gray-200 rounded-md p-2">
      <div className="flex-shrink-0 mr-2 text-sm text-gray-500">{index + 1}.</div>

      <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-2">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex-grow text-sm">{product.name}</div>

      <div className="flex items-center gap-2">
        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
          {product.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
          onClick={() => onRemove(product.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
