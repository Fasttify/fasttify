import { ResourceList, ResourceItem, Thumbnail, Text, EmptyState } from '@shopify/polaris'
import { IProduct } from '@/app/store/components/product-management/collections/types/collection-types'
import { getProductImageUrl } from '@/app/store/components/product-management/collections/utils/collectionUtils'

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
  return (
    <ResourceList
      resourceName={{ singular: 'producto', plural: 'productos' }}
      items={selectedProducts}
      renderItem={item => {
        const { id, name } = item
        const imageUrl = getProductImageUrl(item)
        const media = <Thumbnail source={imageUrl || ''} alt={name} />

        return (
          <ResourceItem
            id={id}
            media={media}
            onClick={() => onOpenDialog()}
            accessibilityLabel={`Ver detalles de ${name}`}
            shortcutActions={[
              {
                content: 'Eliminar',
                onAction: () => onRemoveProduct(id),
              },
            ]}
          >
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {name}
            </Text>
          </ResourceItem>
        )
      }}
      emptyState={
        <EmptyState
          heading="No hay productos en esta colección"
          action={{
            content: 'Añadir productos',
            onAction: onOpenDialog,
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Añade productos para empezar a construir tu colección.</p>
        </EmptyState>
      }
    />
  )
}
