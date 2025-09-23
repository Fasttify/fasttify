import type { SortField, VisibleColumns } from '@/app/store/components/product-management/products/types/product-types';
import { getStatusText, getStatusTone } from '@/app/store/components/product-management/utils/common-utils';
import { formatInventory } from '@/app/store/components/product-management/utils/product-utils';
import { CurrencyDisplay } from '@/app/store/components/currency/CurrencyDisplay';
import type { IProduct } from '@/app/store/hooks/data/useProducts';
import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { openProductUrl } from '@/lib/utils/store-url';
import useStoreDataStore from '@/context/core/storeDataStore';
import {
  ActionList,
  Badge,
  Button,
  Card,
  IndexTable,
  Link as PolarisLink,
  Popover,
  Text,
  Thumbnail,
  useIndexResourceState,
} from '@shopify/polaris';
import { DeleteIcon, DuplicateIcon, EditIcon, ImageIcon, SettingsIcon, ViewIcon } from '@shopify/polaris-icons';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

interface ProductTableDesktopProps {
  products: IProduct[];
  handleEditProduct: (id: string) => void;
  handleDeleteProduct: (id: string) => void;
  handleDuplicateProduct: (id: string) => void;
  handleDeleteSelected: (selectedIds: string[]) => void;
  visibleColumns: VisibleColumns;
  toggleSort: (field: SortField) => void;
  sortDirection: 'ascending' | 'descending';
  sortField: SortField;
  selectedProducts: string[];
  handleSelectProduct: (id: string) => void;
}

export function ProductTableDesktop({
  products,
  handleEditProduct,
  handleDeleteProduct,
  handleDuplicateProduct,
  handleDeleteSelected,
  visibleColumns,
  toggleSort,
  sortDirection,
  sortField,
  selectedProducts: _selectedProducts,
  handleSelectProduct: _handleSelectProduct,
}: ProductTableDesktopProps) {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const { currentStore } = useStoreDataStore();

  const resourceName = {
    singular: 'producto',
    plural: 'productos',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(products);

  const promotedBulkActions = [
    {
      content: 'Eliminar productos',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ];

  // Función para manejar el clic en ver producto
  const handleViewProduct = (product: IProduct) => {
    if (!currentStore || !product.slug) return;

    openProductUrl({
      storeId: currentStore.storeId,
      customDomain: currentStore.defaultDomain ?? undefined,
      productSlug: product.slug,
    });
  };

  const rowMarkup = products.map((product) => {
    const { id, name, images, status, quantity, price, category } = product;
    let imageUrl: string | undefined;

    if (typeof images === 'string') {
      try {
        const parsedImages = JSON.parse(images);
        imageUrl = parsedImages[0]?.url;
      } catch (_e) {
        imageUrl = undefined;
      }
    } else if (Array.isArray(images) && images.length > 0) {
      imageUrl = images[0]?.url;
    }

    const isPopoverActive = activePopover === id;

    return (
      <IndexTable.Row id={id} key={id} selected={selectedResources.includes(id)} position={products.indexOf(product)}>
        <IndexTable.Cell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Thumbnail source={imageUrl || ImageIcon} alt={name} size="small" />
            <PolarisLink url={routes.store.products.edit(storeId, id)} removeUnderline>
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
        {visibleColumns.inventory && <IndexTable.Cell>{formatInventory(quantity ?? 0)}</IndexTable.Cell>}
        {visibleColumns.price && (
          <IndexTable.Cell>
            <CurrencyDisplay value={price} />
          </IndexTable.Cell>
        )}
        {visibleColumns.category && <IndexTable.Cell>{category || 'Sin categoría'}</IndexTable.Cell>}
        {visibleColumns.actions && (
          <IndexTable.Cell>
            {selectedResources.includes(id) ? (
              <Popover
                active={isPopoverActive}
                activator={
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      icon={SettingsIcon}
                      onClick={() => setActivePopover(isPopoverActive ? null : id)}
                      accessibilityLabel="Más opciones"
                      variant="plain"
                    />
                  </div>
                }
                onClose={() => setActivePopover(null)}
                preferredPosition="below"
                preferredAlignment="right">
                <ActionList
                  actionRole="menuitem"
                  items={[
                    {
                      content: 'Ver en tienda',
                      icon: ViewIcon,
                      onAction: () => {
                        handleViewProduct(product);
                        setActivePopover(null);
                      },
                    },
                    {
                      content: 'Editar',
                      icon: EditIcon,
                      onAction: () => {
                        handleEditProduct(id);
                        setActivePopover(null);
                      },
                    },
                    {
                      content: 'Duplicar',
                      icon: DuplicateIcon,
                      onAction: () => {
                        handleDuplicateProduct(id);
                        setActivePopover(null);
                      },
                    },
                    {
                      content: 'Eliminar',
                      icon: DeleteIcon,
                      destructive: true,
                      onAction: () => {
                        handleDeleteProduct(id);
                        setActivePopover(null);
                      },
                    },
                  ]}
                />
              </Popover>
            ) : null}
          </IndexTable.Cell>
        )}
      </IndexTable.Row>
    );
  });

  const headings: { title: string }[] = [{ title: 'Producto' }];
  const sortableColumns: SortField[] = ['name'];

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' });
    sortableColumns.push('status');
  }
  if (visibleColumns.inventory) {
    headings.push({ title: 'Inventario' });
    sortableColumns.push('quantity');
  }
  if (visibleColumns.price) {
    headings.push({ title: 'Precio' });
    sortableColumns.push('price');
  }
  if (visibleColumns.category) {
    headings.push({ title: 'Categoría' });
    sortableColumns.push('category');
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField);

  return (
    <div className="hidden sm:block">
      <Card>
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
          onSort={(index) => {
            const field = sortableColumns[index];
            if (field) {
              toggleSort(field);
            }
          }}>
          {rowMarkup}
        </IndexTable>
      </Card>
    </div>
  );
}
