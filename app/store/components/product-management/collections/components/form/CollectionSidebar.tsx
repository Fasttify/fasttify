import { Card, Select, BlockStack } from '@shopify/polaris';
import { PublicationSection } from '@/app/store/components/product-management/collections/components/form/publication-section';
import { ImageSection } from '@/app/store/components/product-management/collections/components/form/image-section';

interface CollectionSidebarProps {
  isActive: boolean;
  imageUrl: string;
  onActiveChange: (value: boolean) => void;
  onImageChange: (url: string) => void;
}

export function CollectionSidebar({ isActive, imageUrl, onActiveChange, onImageChange }: CollectionSidebarProps) {
  const templateOptions = [{ label: 'Colección predeterminada', value: 'default' }];

  return (
    <BlockStack gap="200">
      <PublicationSection isActive={isActive} onActiveChange={onActiveChange} />

      <ImageSection imageUrl={imageUrl} onImageChange={onImageChange} />

      <Card>
        <Select
          label="Plantilla de tema"
          options={templateOptions}
          value="default"
          onChange={() => {
            // Lógica para cambiar la plantilla si es necesario
          }}
        />
      </Card>
    </BlockStack>
  );
}
