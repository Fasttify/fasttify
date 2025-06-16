import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  ButtonGroup,
  Thumbnail,
  Link as PolarisLink,
} from '@shopify/polaris'
import { EditIcon, DeleteIcon, ImageIcon } from '@shopify/polaris-icons'
import { formatInventory } from '@/app/store/components/product-management/utils/product-utils'
import type { IProduct } from '@/app/store/hooks/useProducts'
import type {
  SortField,
  VisibleColumns,
} from '@/app/store/components/product-management/products/types/product-types'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { routes } from '@/utils/routes'
import {
  formatPrice,
  getStatusText,
  getStatusTone,
} from '@/app/store/components/product-management/utils/common-utils'

interface ProductTableDesktopProps {
  products: IProduct[]
  handleEditProduct: (id: string) => void
  handleDeleteProduct: (id: string) => void
  handleDeleteSelected: (selectedIds: string[]) => void
  visibleColumns: VisibleColumns
  toggleSort: (field: SortField) => void
  sortDirection: 'ascending' | 'descending'
  sortField: SortField
}

export function ProductTableDesktop({
  products,
  handleEditProduct,
  handleDeleteProduct,
  handleDeleteSelected,
  visibleColumns,
  toggleSort,
  sortDirection,
  sortField,
}: ProductTableDesktopProps) {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)

  const resourceName = {
    singular: 'producto',
    plural: 'productos',
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products)

  const promotedBulkActions = [
    {
      content: 'Eliminar productos',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ]

  const rowMarkup = products.map(
    ({ id, name, images, status, quantity, price, category }, index) => {
      let imageUrl: string | undefined

      if (typeof images === 'string') {
        try {
          const parsedImages = JSON.parse(images)
          imageUrl = parsedImages[0]?.url
        } catch (e) {
          imageUrl = undefined
        }
      } else if (Array.isArray(images) && images.length > 0) {
        imageUrl = images[0]?.url
      }

      return (
        <IndexTable.Row id={id} key={id} selected={selectedResources.includes(id)} position={index}>
          <IndexTable.Cell>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Thumbnail source={imageUrl || ImageIcon} alt={name} size="small" />
              <PolarisLink url={routes.store.products.edit(storeId, id)}>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                  {name}
                </Text>
              </PolarisLink>
            </div>
          </IndexTable.Cell>
          {visibleColumns.status && (
            <IndexTable.Cell>
              <Badge tone={getStatusTone(status)}>{getStatusText(status)}</Badge>
            </IndexTable.Cell>
          )}
          {visibleColumns.inventory && (
            <IndexTable.Cell>{formatInventory(quantity ?? 0)}</IndexTable.Cell>
          )}
          {visibleColumns.price && <IndexTable.Cell>{formatPrice(price)}</IndexTable.Cell>}
          {visibleColumns.category && (
            <IndexTable.Cell>{category || 'Sin categoría'}</IndexTable.Cell>
          )}
          {visibleColumns.actions && (
            <IndexTable.Cell>
              <ButtonGroup>
                <Button
                  icon={EditIcon}
                  onClick={() => handleEditProduct(id)}
                  accessibilityLabel="Edit product"
                />
                <Button
                  icon={DeleteIcon}
                  onClick={() => handleDeleteProduct(id)}
                  accessibilityLabel="Delete product"
                  tone="critical"
                />
              </ButtonGroup>
            </IndexTable.Cell>
          )}
        </IndexTable.Row>
      )
    }
  )

  const headings: { title: string }[] = [{ title: 'Producto' }]
  const sortableColumns: SortField[] = ['name']

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' })
    sortableColumns.push('status')
  }
  if (visibleColumns.inventory) {
    headings.push({ title: 'Inventario' })
    sortableColumns.push('quantity')
  }
  if (visibleColumns.price) {
    headings.push({ title: 'Precio' })
    sortableColumns.push('price')
  }
  if (visibleColumns.category) {
    headings.push({ title: 'Categoría' })
    sortableColumns.push('category')
  }
  if (visibleColumns.actions) {
    headings.push({ title: 'Acciones' })
    sortableColumns.push('creationDate')
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField)

  return (
    <div className="hidden sm:block">
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={products.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          headings={headings as [{ title: string }]}
          sortable={[true, true, true, true, true, false]}
          sortDirection={sortDirection}
          sortColumnIndex={sortColumnIndex}
          onSort={index => {
            const field = sortableColumns[index]
            if (field) {
              toggleSort(field)
            }
          }}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </div>
  )
}
