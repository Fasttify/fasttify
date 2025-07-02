import { Card, ChoiceList, BlockStack, Text, Box } from '@shopify/polaris';
import { useState } from 'react';

export function PublicationSection({
  isActive,
  onActiveChange,
}: {
  isActive?: boolean;
  onActiveChange: (isActive: boolean) => void;
}) {
  const [selected, setSelected] = useState([isActive ? 'active' : 'inactive']);

  const handleChange = (value: string[]) => {
    setSelected(value);
    onActiveChange(value[0] === 'active');
  };

  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">
          Estado de la colección
        </Text>
        <ChoiceList
          title="Estado"
          titleHidden
          choices={[
            { label: 'Activa', value: 'active' },
            { label: 'Borrador', value: 'inactive' },
          ]}
          selected={selected}
          onChange={handleChange}
        />
        {selected[0] === 'active' && (
          <Box>
            <Text as="p" tone="subdued">
              Esta colección estará visible en tu tienda.
            </Text>
          </Box>
        )}
        {selected[0] === 'inactive' && (
          <Box>
            <Text as="p" tone="subdued">
              Esta colección no será visible hasta que la marques como activa.
            </Text>
          </Box>
        )}
      </BlockStack>
    </Card>
  );
}
