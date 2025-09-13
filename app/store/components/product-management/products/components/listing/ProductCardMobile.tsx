import { Badge, BlockStack, Box, Button, ButtonGroup, Checkbox, Text, Thumbnail } from '@shopify/polaris';
import { DeleteIcon, DuplicateIcon, EditIcon, ImageIcon } from '@shopify/polaris-icons';

import type { VisibleColumns } from '@/app/store/components/product-management/products/types/product-types';
import { getStatusText, getStatusTone } from '@/app/store/components/product-management/utils/common-utils';
import { formatInventory } from '@/app/store/components/product-management/utils/product-utils';
import { CurrencyDisplay } from '@/app/store/components/currency/CurrencyDisplay';
import type { IProduct } from '@/app/store/hooks/data/useProducts';

interface ProductCardMobileProps {
  products: IProduct[];
  selectedProducts: string[];
  handleSelectProduct: (id: string) => void;
  handleEditProduct: (id: string) => void;
  handleDeleteProduct: (id: string) => void;
  handleDuplicateProduct: (id: string) => void;
  visibleColumns: VisibleColumns;
}

export function ProductCardMobile({
  products,
  selectedProducts,
  handleSelectProduct,
  handleEditProduct,
  handleDeleteProduct,
  handleDuplicateProduct,
  visibleColumns,
}: ProductCardMobileProps) {
  const getImageUrl = (images: IProduct['images']) => {
    if (typeof images === 'string') {
      try {
        const parsedImages = JSON.parse(images);
        return Array.isArray(parsedImages) ? parsedImages[0]?.url : undefined;
      } catch (_e) {
        return undefined;
      }
    }
    return Array.isArray(images) ? images[0]?.url : undefined;
  };

  return (
    <div className="sm:hidden">
      {products.map((product) => {
        const productId = product.id;
        return (
          <Box key={productId} padding="400" borderBlockEndWidth="025" borderColor="border">
            <BlockStack gap="200">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Thumbnail source={getImageUrl(product.images) || ImageIcon} alt={product.name} size="small" />
                  <Box>
                    <Text variant="bodyMd" as="h3" fontWeight="semibold">
                      {product.name}
                    </Text>
                    {visibleColumns.category && (
                      <Text variant="bodySm" tone="subdued" as="p">
                        {product.category || 'Sin categoría'}
                      </Text>
                    )}
                  </Box>
                </div>
                <Checkbox
                  label=""
                  labelHidden
                  checked={selectedProducts.includes(productId)}
                  onChange={() => handleSelectProduct(productId)}
                />
              </div>

              <Box paddingBlockStart="400" paddingBlockEnd="400">
                <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: 16 }}>
                  {visibleColumns.status && (
                    <Box>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Estado
                      </Text>
                      <Badge tone={getStatusTone(product.status)}>{getStatusText(product.status)}</Badge>
                    </Box>
                  )}
                  {visibleColumns.price && (
                    <Box>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Precio
                      </Text>
                      <Text variant="bodyMd" as="p">
                        <CurrencyDisplay value={product.price} />
                      </Text>
                    </Box>
                  )}
                  {visibleColumns.inventory && (
                    <Box>
                      <Text variant="bodySm" tone="subdued" as="p">
                        Inventario
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {formatInventory(product.quantity ?? 0)}
                      </Text>
                    </Box>
                  )}
                </div>
              </Box>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {selectedProducts.includes(productId) ? (
                  <ButtonGroup>
                    <Button icon={EditIcon} onClick={() => handleEditProduct(productId)} size="slim">
                      Editar
                    </Button>
                    <Button icon={DuplicateIcon} onClick={() => handleDuplicateProduct(productId)} size="slim">
                      Duplicar
                    </Button>
                    <Button
                      icon={DeleteIcon}
                      onClick={() => handleDeleteProduct(productId)}
                      size="slim"
                      variant="plain"
                      tone="critical">
                      Eliminar
                    </Button>
                  </ButtonGroup>
                ) : null}
              </div>
            </BlockStack>
          </Box>
        );
      })}
    </div>
  );
}
