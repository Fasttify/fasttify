import { Badge, Box, Button, ButtonGroup, Checkbox, LegacyStack, Text, Thumbnail } from '@shopify/polaris';
import { EditIcon, DeleteIcon, ImageIcon } from '@shopify/polaris-icons';

import { formatInventory } from '@/app/store/components/product-management/utils/product-utils';
import type { IProduct } from '@/app/store/hooks/data/useProducts';
import type { VisibleColumns } from '@/app/store/components/product-management/products/types/product-types';
import { getStatusText, getStatusTone } from '@/app/store/components/product-management/utils/common-utils';

interface ProductCardMobileProps {
  products: IProduct[];
  selectedProducts: string[];
  handleSelectProduct: (id: string) => void;
  handleEditProduct: (id: string) => void;
  handleDeleteProduct: (id: string) => void;
  visibleColumns: VisibleColumns;
}

export function ProductCardMobile({
  products,
  selectedProducts,
  handleSelectProduct,
  handleEditProduct,
  handleDeleteProduct,
  visibleColumns,
}: ProductCardMobileProps) {
  const getImageUrl = (images: IProduct['images']) => {
    if (typeof images === 'string') {
      try {
        const parsedImages = JSON.parse(images);
        return Array.isArray(parsedImages) ? parsedImages[0]?.url : undefined;
      } catch (e) {
        return undefined;
      }
    }
    return Array.isArray(images) ? images[0]?.url : undefined;
  };

  return (
    <div className="sm:hidden">
      {products.map((product) => (
        <Box key={product.id} padding="400" borderBlockEndWidth="025" borderColor="border">
          <LegacyStack distribution="equalSpacing" alignment="center">
            <LegacyStack alignment="center" spacing="baseTight">
              <Thumbnail source={getImageUrl(product.images) || ImageIcon} alt={product.name} size="small" />
              <LegacyStack.Item>
                <Text variant="bodyMd" as="h3" fontWeight="semibold">
                  {product.name}
                </Text>
                {visibleColumns.category && (
                  <Text variant="bodySm" tone="subdued" as="p">
                    {product.category || 'Sin categoría'}
                  </Text>
                )}
              </LegacyStack.Item>
            </LegacyStack>
            <Checkbox
              label=""
              labelHidden
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleSelectProduct(product.id)}
            />
          </LegacyStack>

          <Box paddingBlockStart="400" paddingBlockEnd="400">
            <LegacyStack distribution="fillEvenly">
              {visibleColumns.status && (
                <LegacyStack.Item>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Estado
                  </Text>
                  <Badge tone={getStatusTone(product.status)}>{getStatusText(product.status)}</Badge>
                </LegacyStack.Item>
              )}
              {visibleColumns.price && (
                <LegacyStack.Item>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Precio
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {product.price ? `$${Number(product.price).toLocaleString('es-CO')}` : '$0'}
                  </Text>
                </LegacyStack.Item>
              )}
              {visibleColumns.inventory && (
                <LegacyStack.Item>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Inventario
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {formatInventory(product.quantity ?? 0)}
                  </Text>
                </LegacyStack.Item>
              )}
            </LegacyStack>
          </Box>

          <LegacyStack distribution="trailing">
            <ButtonGroup>
              <Button icon={EditIcon} onClick={() => handleEditProduct(product.id)} size="slim">
                Editar
              </Button>
              <Button
                icon={DeleteIcon}
                onClick={() => handleDeleteProduct(product.id)}
                size="slim"
                variant="plain"
                tone="critical">
                Eliminar
              </Button>
            </ButtonGroup>
          </LegacyStack>
        </Box>
      ))}
    </div>
  );
}
