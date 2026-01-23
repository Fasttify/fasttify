import { InventoryRowProps } from '@/app/store/components/product-management/inventory/components/InventoryTable';
import { Card, Text, TextField, Thumbnail } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';

interface InventoryCardMobileProps {
  data: InventoryRowProps[];
  editedQuantities: Record<string, number>;
  onQuantityChange: (productId: string, value: number) => void;
}

export function InventoryCardMobile({ data, editedQuantities, onQuantityChange }: InventoryCardMobileProps) {
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
          const currentStock = editedQuantities[item.id] !== undefined ? editedQuantities[item.id] : item.inStock;

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
                  <Text variant="bodyMd" fontWeight="regular" as="p" tone="base">
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
                  <div style={{ width: '80px' }}>
                    <TextField
                      value={currentStock.toString()}
                      onChange={(value) => onQuantityChange(item.id, parseInt(value) || 0)}
                      type="number"
                      autoComplete="off"
                      label=""
                      labelHidden
                    />
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
