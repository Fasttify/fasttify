import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DescriptionEditor } from '@/app/store/components/product-management/collection-form/description-editor'
import { ProductSection } from '@/app/store/components/product-management/collection-form/product-section'
import { IProduct } from '@/app/store/components/product-management/collection-form/types/productTypes'

interface CollectionContentProps {
  title: string
  description: string
  slug: string
  selectedProducts: IProduct[]
  currentStoreCustomDomain?: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAddProduct: (product: IProduct) => void
  onRemoveProduct: (productId: string) => void
}

export function CollectionContent({
  title,
  description,
  slug,
  selectedProducts,
  currentStoreCustomDomain,
  onTitleChange,
  onDescriptionChange,
  onAddProduct,
  onRemoveProduct,
}: CollectionContentProps) {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Title Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título
            </label>
            <Input
              id="title"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              className="border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <DescriptionEditor initialValue={description} onChange={onDescriptionChange} />
          </div>
        </div>
      </div>

      {/* Products Section */}
      <ProductSection
        selectedProducts={selectedProducts}
        onAddProduct={onAddProduct}
        onRemoveProduct={onRemoveProduct}
      />

      {/* SEO Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium">Publicación del motor de búsqueda</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="text-sm">Mi tienda</div>
          <div className="text-xs text-blue-600">
            {currentStoreCustomDomain} › collections › {slug || 'frontpage'}
          </div>
          <div className="text-blue-600 text-base font-medium">{title}</div>
        </div>
      </div>
    </div>
  )
}
