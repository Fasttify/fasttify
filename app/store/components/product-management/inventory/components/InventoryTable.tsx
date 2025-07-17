import { useToast } from '@/app/store/context/ToastContext';
import { useProducts } from '@/app/store/hooks/data/useProducts';
import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { Button, ButtonGroup, IndexTable, Link, Text, TextField, Thumbnail } from '@shopify/polaris';
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
}

export default function InventoryTable({ data }: InventoryTableProps) {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);
  const { updateProduct } = useProducts(storeId);
  const { showToast } = useToast();

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [editingRows, setEditingRows] = useState<{ [key: string]: number }>({});

  const resourceName = {
    singular: 'producto',
    plural: 'productos',
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updateProduct({
        id: productId,
        quantity: newStock,
      });
      showToast('Inventario actualizado correctamente');

      // Remove from editing state
      const newEditingRows = { ...editingRows };
      delete newEditingRows[productId];
      setEditingRows(newEditingRows);
    } catch (error) {
      showToast('Error al actualizar el inventario', true);
    }
  };

  const handleStockChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditingRows({
      ...editingRows,
      [productId]: numValue,
    });
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
    const currentStock = editingRows[item.id] !== undefined ? editingRows[item.id] : item.inStock;
    const isEditing = editingRows[item.id] !== undefined;

    return (
      <IndexTable.Row id={item.id} key={item.id} position={index} selected={selectedResources.includes(item.id)}>
        <IndexTable.Cell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {imageUrl ? (
              <Thumbnail source={imageUrl} alt={item.name} size="small" />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f3f3f3',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ImageIcon />
              </div>
            )}
            <div>
              <Link url={routes.store.products.edit(storeId, item.id)}>
                <Text variant="bodyMd" fontWeight="semibold" as="span">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '80px' }}>
              <TextField
                value={currentStock.toString()}
                onChange={(value) => handleStockChange(item.id, value)}
                type="number"
                autoComplete="off"
                label=""
                labelHidden
              />
            </div>
            {isEditing && (
              <ButtonGroup>
                <span onClick={(e) => e.stopPropagation()}>
                  <Button size="micro" onClick={() => handleStockUpdate(item.id, currentStock)}>
                    Guardar
                  </Button>
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="micro"
                    onClick={() => {
                      const newEditingRows = { ...editingRows };
                      delete newEditingRows[item.id];
                      setEditingRows(newEditingRows);
                    }}>
                    Cancelar
                  </Button>
                </span>
              </ButtonGroup>
            )}
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
