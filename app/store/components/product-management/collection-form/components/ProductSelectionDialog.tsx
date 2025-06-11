import {
  Modal,
  TextField,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
  Spinner,
  EmptyState,
} from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons'
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
  onProductSelect: (productId: string[]) => void
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
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Seleccionar productos"
      primaryAction={{
        content: 'Confirmar selección',
        onAction: onConfirm,
        disabled: loading,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <TextField
          label="Buscar productos"
          labelHidden
          placeholder="Buscar productos"
          value={searchTerm}
          onChange={onSearchChange}
          prefix={<SearchIcon />}
          autoComplete="off"
        />
      </Modal.Section>
      <Modal.Section>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spinner accessibilityLabel="Cargando productos" size="large" />
          </div>
        ) : (
          <ResourceList
            resourceName={{ singular: 'producto', plural: 'productos' }}
            items={products}
            selectedItems={selectedProductIds}
            onSelectionChange={onProductSelect}
            selectable
            renderItem={item => {
              const { id, name, price } = item
              const imageUrl = getProductImageUrl(item)
              const media = <Thumbnail source={imageUrl || ''} alt={name} />

              return (
                <ResourceItem
                  id={id}
                  media={media}
                  accessibilityLabel={`Ver detalles de ${name}`}
                  onClick={() => onClose()}
                >
                  <Text variant="bodyMd" fontWeight="bold" as="h3">
                    {name}
                  </Text>
                  <div>{formatPrice(price)}</div>
                </ResourceItem>
              )
            }}
            emptyState={
              <EmptyState
                heading="No se encontraron productos"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Prueba con un término de búsqueda diferente.</p>
              </EmptyState>
            }
          />
        )}
      </Modal.Section>
    </Modal>
  )
}
