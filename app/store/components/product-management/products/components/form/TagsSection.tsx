import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { BlockStack, Button, Card, InlineStack, Tag, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface TagsSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function TagsSection({ form }: TagsSectionProps) {
  const [newTag, setNewTag] = useState('');
  const tags = form.watch('tags') || [];

  const addTag = () => {
    const value = newTag.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setNewTag('');
      return;
    }
    const updated = [...tags, value];
    form.setValue('tags', updated, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setNewTag('');
  };

  const removeTag = (value: string) => {
    const updated = tags.filter((t) => t !== value);
    form.setValue('tags', updated, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Etiquetas
        </Text>

        <TextField
          label="Nueva etiqueta"
          labelHidden
          value={newTag}
          onChange={setNewTag}
          placeholder="Ej.: verano, oferta, camiseta"
          autoComplete="off"
          connectedRight={
            <Button onClick={addTag} disabled={!newTag.trim()}>
              Agregar
            </Button>
          }
        />

        {tags.length > 0 && (
          <InlineStack gap="100" wrap>
            {tags.map((tag) => (
              <Tag key={tag} onRemove={() => removeTag(tag)}>
                {tag}
              </Tag>
            ))}
          </InlineStack>
        )}
      </BlockStack>
    </Card>
  );
}
