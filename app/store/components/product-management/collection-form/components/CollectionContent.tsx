import { Card, TextField, BlockStack, Text } from '@shopify/polaris'
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
  selectedProducts,
  currentStoreCustomDomain,
  slug,
  onTitleChange,
  onDescriptionChange,
  onAddProduct,
  onRemoveProduct,
}: CollectionContentProps) {
  return (
    <BlockStack gap="200">
      <Card>
        <BlockStack gap="200">
          <TextField label="Título" value={title} onChange={onTitleChange} autoComplete="off" />
          <DescriptionEditor initialValue={description} onChange={onDescriptionChange} />
        </BlockStack>
      </Card>

      <ProductSection
        selectedProducts={selectedProducts}
        onAddProduct={onAddProduct}
        onRemoveProduct={onRemoveProduct}
      />

      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingSm">
            Publicación del motor de búsqueda
          </Text>
          <Text as="p" variant="bodySm">
            {currentStoreCustomDomain} › collections › {slug || 'frontpage'}
          </Text>
          <Text as="p" variant="bodyMd">
            {title}
          </Text>
        </BlockStack>
      </Card>
    </BlockStack>
  )
}
