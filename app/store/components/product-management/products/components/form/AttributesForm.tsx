import { useState, useCallback } from 'react';
import {
  Card,
  Text,
  BlockStack,
  TextField,
  Button,
  ResourceList,
  ResourceItem,
  LegacyStack,
  Tag,
  EmptyState,
  Banner,
} from '@shopify/polaris';

interface Attribute {
  name?: string;
  values?: string[];
}

interface AttributesFormProps {
  value: Attribute[];
  onChange: (value: Attribute[]) => void;
}

export function AttributesForm({ value: attributes, onChange }: AttributesFormProps) {
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [selectedAttributeIndex, setSelectedAttributeIndex] = useState<string | undefined>(
    attributes.length > 0 ? '0' : undefined
  );

  const handleAddAttribute = useCallback(() => {
    if (!newAttributeName.trim()) return;
    const newAttributes = [...attributes, { name: newAttributeName.trim(), values: [] }];
    onChange(newAttributes);
    setNewAttributeName('');
    setSelectedAttributeIndex(String(newAttributes.length - 1));
  }, [newAttributeName, attributes, onChange]);

  const handleRemoveAttribute = useCallback(
    (indexToRemove: number) => {
      const newAttributes = attributes.filter((_, i) => i !== indexToRemove);
      onChange(newAttributes);

      const currentSelected = selectedAttributeIndex ? parseInt(selectedAttributeIndex, 10) : -1;

      if (currentSelected === indexToRemove) {
        setSelectedAttributeIndex(newAttributes.length > 0 ? '0' : undefined);
      } else if (currentSelected > indexToRemove) {
        setSelectedAttributeIndex(String(currentSelected - 1));
      }
    },
    [attributes, onChange, selectedAttributeIndex]
  );

  const handleAddAttributeValue = useCallback(() => {
    const index = selectedAttributeIndex ? parseInt(selectedAttributeIndex, 10) : -1;
    if (index === -1 || !newAttributeValue.trim()) return;

    const newAttributes = [...attributes];
    const currentAttribute = newAttributes[index];
    if (!currentAttribute.values?.includes(newAttributeValue.trim())) {
      currentAttribute.values = [...(currentAttribute.values || []), newAttributeValue.trim()];
      onChange(newAttributes);
    }
    setNewAttributeValue('');
  }, [newAttributeValue, selectedAttributeIndex, attributes, onChange]);

  const handleRemoveAttributeValue = useCallback(
    (valueIndex: number) => {
      const index = selectedAttributeIndex ? parseInt(selectedAttributeIndex, 10) : -1;
      if (index === -1) return;
      const newAttributes = [...attributes];
      newAttributes[index].values?.splice(valueIndex, 1);
      onChange(newAttributes);
    },
    [selectedAttributeIndex, attributes, onChange]
  );

  const selectedIndex = selectedAttributeIndex !== undefined ? parseInt(selectedAttributeIndex, 10) : -1;
  const selectedAttribute = selectedIndex !== -1 ? attributes[selectedIndex] : null;

  const resourceListItems = attributes.map((attr, index) => {
    return {
      id: String(index),
      name: attr.name || '',
      actions: [{ content: 'Eliminar', onAction: () => handleRemoveAttribute(index) }],
    };
  });

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Atributos
        </Text>
        <Text as="p" tone="subdued">
          Agregue atributos como talla, color, etc. para crear variantes del producto.
        </Text>
        <TextField
          label="Nuevo Atributo"
          labelHidden
          value={newAttributeName}
          onChange={setNewAttributeName}
          placeholder="ej. Talla, Color"
          autoComplete="off"
          connectedRight={
            <Button onClick={handleAddAttribute} disabled={!newAttributeName.trim()}>
              Agregar Atributo
            </Button>
          }
        />

        {attributes.length > 0 ? (
          <BlockStack gap="400">
            <ResourceList
              resourceName={{ singular: 'atributo', plural: 'atributos' }}
              items={resourceListItems}
              selectedItems={selectedAttributeIndex ? [selectedAttributeIndex] : []}
              onSelectionChange={(selected) => {
                setSelectedAttributeIndex(selected[0]);
              }}
              renderItem={(item) => {
                const { id, name, actions } = item;
                return (
                  <ResourceItem
                    id={id}
                    onClick={() => setSelectedAttributeIndex(id)}
                    shortcutActions={actions}
                    persistActions>
                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                      {name}
                    </Text>
                  </ResourceItem>
                );
              }}
            />

            {selectedAttribute ? (
              <Card background="bg-surface-secondary" roundedAbove="sm">
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3">
                    Valores de {selectedAttribute.name}
                  </Text>
                  <TextField
                    label={`Nuevo valor para ${selectedAttribute.name}`}
                    labelHidden
                    value={newAttributeValue}
                    onChange={setNewAttributeValue}
                    placeholder={`Agregar valor a ${selectedAttribute.name?.toLowerCase()}`}
                    autoComplete="off"
                    connectedRight={
                      <Button onClick={handleAddAttributeValue} disabled={!newAttributeValue.trim()}>
                        Añadir
                      </Button>
                    }
                  />
                  <LegacyStack spacing="tight" wrap>
                    {(selectedAttribute.values || []).map((val, index) => (
                      <Tag key={index} onRemove={() => handleRemoveAttributeValue(index)}>
                        {val}
                      </Tag>
                    ))}
                  </LegacyStack>
                </BlockStack>
              </Card>
            ) : (
              <Banner title="Seleccione un atributo" tone="info">
                <p>Seleccione un atributo de la lista para agregarle valores.</p>
              </Banner>
            )}
          </BlockStack>
        ) : (
          <EmptyState
            heading="Aún no hay atributos"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
            <p>Agregue un atributo para empezar a crear variantes de producto.</p>
          </EmptyState>
        )}
      </BlockStack>
    </Card>
  );
}
