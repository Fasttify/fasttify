import { InventoryRowProps } from '@/app/store/components/product-management/inventory/components/InventoryTable';
import { useToast } from '@/app/store/context/ToastContext';
import { useProducts } from '@/app/store/hooks/data/useProducts';
import { getStoreId } from '@/utils/client/store-utils';
import { Button, ButtonGroup, Card, Text, TextField, Thumbnail } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

interface InventoryCardMobileProps {
  data: InventoryRowProps[];
}

export function InventoryCardMobile({ data }: InventoryCardMobileProps) {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);
  const { updateProduct } = useProducts(storeId);
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [inStockValues, setInStockValues] = useState<Record<string, number>>(
    data.reduce((acc, item) => ({ ...acc, [item.id]: item.inStock }), {})
  );

  const handleUpdateQuantity = async (id: string, name: string) => {
    try {
      await updateProduct({
        id,
        quantity: inStockValues[id],
      });
      showToast(`Inventario de "${name}" actualizado correctamente`);
      setEditingId(null);
    } catch (_error) {
      showToast('Error al actualizar el inventario', true);
      setInStockValues((prev) => ({ ...prev, [id]: data.find((item) => item.id === id)?.inStock || 0 }));
    }
  };

  const handleDiscardChanges = (id: string) => {
    setInStockValues((prev) => ({
      ...prev,
      [id]: data.find((item) => item.id === id)?.inStock || 0,
    }));
    setEditingId(null);
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

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item) => {
          const imageUrl = getImageUrl(item.images);
          const isEditing = editingId === item.id;

          return (
            <Card key={item.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                {imageUrl ? (
                  <Thumbnail source={imageUrl} alt={item.name} size="medium" />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
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
                  <Text variant="bodyMd" fontWeight="semibold" as="p">
                    {item.name}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="p">
                    SKU: {item.sku || '-'}
                  </Text>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px',
                }}>
                <div>
                  <Text variant="bodySm" tone="subdued" as="p">
                    No disponible
                  </Text>
                  <Text variant="bodyMd" fontWeight="semibold" as="p">
                    {item.unavailable}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Comprometido
                  </Text>
                  <Text variant="bodyMd" fontWeight="semibold" as="p">
                    {item.committed}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Disponible
                  </Text>
                  <Text variant="bodyMd" fontWeight="semibold" as="p">
                    {item.available}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" tone="subdued" as="p">
                    En stock
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '80px' }}>
                      <TextField
                        value={inStockValues[item.id]?.toString() || '0'}
                        onChange={(value) => {
                          setEditingId(item.id);
                          setInStockValues((prev) => ({
                            ...prev,
                            [item.id]: parseInt(value) || 0,
                          }));
                        }}
                        type="number"
                        autoComplete="off"
                        label=""
                        labelHidden
                      />
                    </div>
                    {isEditing && (
                      <ButtonGroup>
                        <Button size="micro" onClick={() => handleUpdateQuantity(item.id, item.name)}>
                          Guardar
                        </Button>
                        <Button size="micro" onClick={() => handleDiscardChanges(item.id)}>
                          Cancelar
                        </Button>
                      </ButtonGroup>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
