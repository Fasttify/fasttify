import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { IndexTable, Link, Text, TextField, Thumbnail } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

export interface InventoryRowProps {
  id: string;
  name: string;
  sku: string;
  unavailable: number;
  committed: number;
  available: number;
  inStock: number;
  images?:
    | Array<{
        url: string;
        alt?: string;
      }>
    | string;
}

interface InventoryTableProps {
  data: InventoryRowProps[];
  editedQuantities: Record<string, number>;
  onQuantityChange: (productId: string, value: number) => void;
}

export default function InventoryTable({ data, editedQuantities, onQuantityChange }: InventoryTableProps) {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const resourceName = {
    singular: 'producto',
    plural: 'productos',
  };

  const getImageUrl = (images: InventoryRowProps['images']) => {
    if (!images) return null;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return parsed[0]?.url || null;
      } catch {
        return null;
      }
    }
    return Array.isArray(images) && images.length > 0 ? images[0].url : null;
  };

  const rowMarkup = data.map((item, index) => {
    const imageUrl = getImageUrl(item.images);
    const currentStock = editedQuantities[item.id] !== undefined ? editedQuantities[item.id] : item.inStock;

    return (
      <IndexTable.Row id={item.id} key={item.id} position={index} selected={selectedResources.includes(item.id)}>
        <IndexTable.Cell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {imageUrl ? (
              <Thumbnail source={imageUrl} alt={item.name} size="small" />
            ) : (
              <Thumbnail source={ImageIcon} alt={item.name} size="small" />
            )}
            <div>
              <Link url={routes.store.products.edit(storeId, item.id)} removeUnderline>
                <Text variant="bodyMd" fontWeight="regular" as="span" tone="base">
                  {item.name}
                </Text>
              </Link>
            </div>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {item.sku || '-'}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {item.unavailable}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {item.committed}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {item.available}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '80px' }}>
            <TextField
              value={currentStock.toString()}
              onChange={(value) => onQuantityChange(item.id, parseInt(value) || 0)}
              type="number"
              autoComplete="off"
              label=""
              labelHidden
            />
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <>
      <IndexTable
        resourceName={resourceName}
        itemCount={data.length}
        selectedItemsCount={selectedResources.length}
        onSelectionChange={(selectionType, toggleType, selection) => {
          if (selectionType === 'all') {
            if (toggleType) {
              setSelectedResources(data.map((item) => item.id));
            } else {
              setSelectedResources([]);
            }
          } else if (selectionType === 'page') {
            if (toggleType) {
              setSelectedResources(data.map((item) => item.id));
            } else {
              setSelectedResources([]);
            }
          } else if (typeof selection === 'string') {
            if (toggleType) {
              setSelectedResources((prev) => [...prev, selection]);
            } else {
              setSelectedResources((prev) => prev.filter((id) => id !== selection));
            }
          }
        }}
        headings={[
          { title: 'Producto', id: 'product' },
          { title: 'SKU', id: 'sku' },
          { title: 'No disponible', id: 'unavailable' },
          { title: 'Comprometido', id: 'committed' },
          { title: 'Disponible', id: 'available' },
          { title: 'En existencia', id: 'stock' },
        ]}
        selectable>
        {rowMarkup}
      </IndexTable>
    </>
  );
}
