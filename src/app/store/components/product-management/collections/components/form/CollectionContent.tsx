import { Card, TextField, BlockStack, Text } from '@shopify/polaris';
import { DescriptionEditor } from '@/app/store/components/product-management/collections/components/form/DescriptionEditor';
import { ProductSection } from '@/app/store/components/product-management/collections/components/form/ProductSection';
import { IProduct } from '@/app/store/components/product-management/collections/types/collection-types';

interface CollectionContentProps {
  title: string;
  description: string;
  slug: string;
  selectedProducts: IProduct[];
  currentStoreCustomDomain?: string;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddProduct: (product: IProduct) => void;
  onRemoveProduct: (productId: string) => void;
}

export function CollectionContent({
  title,
  description,
  selectedProducts,
  currentStoreCustomDomain,
  slug,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onAddProduct,
  onRemoveProduct,
}: CollectionContentProps) {
  return (
    <BlockStack gap="200">
      <Card>
        <BlockStack gap="200">
          <TextField label="Título" value={title} onChange={onTitleChange} autoComplete="off" />
          <TextField
            label="Slug"
            value={slug}
            onChange={onSlugChange}
            autoComplete="off"
            helpText="URL única de la colección"
          />
          <DescriptionEditor initialValue={description} onChange={onDescriptionChange} />
        </BlockStack>
      </Card>

      <ProductSection
        selectedProducts={selectedProducts}
        onAddProduct={onAddProduct}
        onRemoveProduct={onRemoveProduct}
      />

      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingSm">
            Publicación del motor de búsqueda
          </Text>
          <Text as="p" variant="bodySm">
            {currentStoreCustomDomain} › collections › {slug || 'frontpage'}
          </Text>
          <Text as="p" variant="bodyMd">
            {title}
          </Text>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
