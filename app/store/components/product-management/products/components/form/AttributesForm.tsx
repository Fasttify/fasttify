import { lazy, Suspense, useCallback } from 'react';
import { BlockStack, Button, Text, SkeletonBodyText, SkeletonDisplayText, Box } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { getDefaultVariant, DefaultVariantOption } from '../../data/default-variants';
import { useAttributes, Attribute } from '../../hooks/useAttributes';
import { useVariantSelection } from '../../hooks/useVariantSelection';
import { hasAttributeWithName } from '../../utils/attributeUtils';

// Lazy load de componentes pesados
const SimpleAttributeSelector = lazy(() =>
  import('./SimpleAttributeSelector').then((module) => ({ default: module.SimpleAttributeSelector }))
);
const VariantOptionSelector = lazy(() =>
  import('./VariantOptionSelector').then((module) => ({ default: module.VariantOptionSelector }))
);
const VariantsDisplay = lazy(() => import('./VariantsDisplay').then((module) => ({ default: module.VariantsDisplay })));

interface AttributesFormProps {
  value: Attribute[];
  onChange: (value: Attribute[]) => void;
}

export function AttributesForm({ value: attributes, onChange }: AttributesFormProps) {
  const {
    selectedVariant,
    editingVariantIndex,
    showSelector,
    selectVariant,
    showAttributeSelector,
    hideAttributeSelector,
    backToDisplay,
    getCurrentVariant,
  } = useVariantSelection();

  const {
    addOptionToAttribute,
    removeOptionFromAttribute,
    addCustomOptionToAttribute,
    createAttribute,
    removeAttribute,
  } = useAttributes({ attributes, onChange });

  const handleSelectVariant = useCallback(
    (variantName: string) => {
      const variant = getDefaultVariant(variantName);
      if (variant) {
        // Crear el atributo automáticamente si no existe
        if (!hasAttributeWithName(attributes, variantName)) {
          createAttribute(variantName);
        }
        selectVariant(variantName);
      } else {
        // Crear atributo personalizado
        createAttribute(variantName);
      }
    },
    [attributes, createAttribute, selectVariant]
  );

  const handleCreateCustom = useCallback(() => {
    createAttribute('');
  }, [createAttribute]);

  const handleRemoveVariant = useCallback(
    (index: number) => {
      removeAttribute(index);
    },
    [removeAttribute]
  );

  const handleAddOption = useCallback(
    (option: DefaultVariantOption) => {
      if (!selectedVariant) return;

      const variantIndex =
        editingVariantIndex !== null
          ? editingVariantIndex
          : attributes.findIndex((attr) => attr.name === selectedVariant);

      if (variantIndex !== -1) {
        addOptionToAttribute(variantIndex, option);
      }
    },
    [selectedVariant, editingVariantIndex, attributes, addOptionToAttribute]
  );

  const handleRemoveOption = useCallback(
    (optionValue: string) => {
      if (!selectedVariant) return;

      const variantIndex =
        editingVariantIndex !== null
          ? editingVariantIndex
          : attributes.findIndex((attr) => attr.name === selectedVariant);

      if (variantIndex !== -1) {
        removeOptionFromAttribute(variantIndex, optionValue);
      }
    },
    [selectedVariant, editingVariantIndex, attributes, removeOptionFromAttribute]
  );

  const handleAddCustomOption = useCallback(
    (customValue: string) => {
      if (!selectedVariant) return;

      const variantIndex =
        editingVariantIndex !== null
          ? editingVariantIndex
          : attributes.findIndex((attr) => attr.name === selectedVariant);

      if (variantIndex !== -1) {
        addCustomOptionToAttribute(variantIndex, customValue);
      }
    },
    [selectedVariant, editingVariantIndex, attributes, addCustomOptionToAttribute]
  );

  const currentVariant = getCurrentVariant();
  const currentAttribute = selectedVariant ? attributes.find((attr) => attr.name === selectedVariant) : null;

  // Mostrar el selector de variantes
  if (selectedVariant && currentVariant && currentAttribute) {
    return (
      <BlockStack gap="400">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="plain" icon={ArrowLeftIcon} onClick={backToDisplay}>
            Volver
          </Button>
          <Text as="h3" variant="headingMd">
            Configurar {currentVariant.label}
          </Text>
        </div>
        <Suspense
          fallback={
            <Box padding="400">
              <BlockStack gap="400">
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={2} />
                <Box paddingBlockStart="400">
                  <SkeletonBodyText lines={3} />
                </Box>
                <Box paddingBlockStart="400">
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>
            </Box>
          }>
          <VariantOptionSelector
            variant={currentVariant}
            selectedOptions={currentAttribute.values || []}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onAddCustomOption={handleAddCustomOption}
          />
        </Suspense>
      </BlockStack>
    );
  }

  // Mostrar el selector de atributos
  if (!selectedVariant) {
    return (
      <BlockStack gap="400">
        <Suspense
          fallback={
            <Box padding="400">
              <BlockStack gap="400">
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={2} />
                <Box paddingBlockStart="400">
                  <SkeletonBodyText lines={4} />
                </Box>
                <Box paddingBlockStart="400">
                  <SkeletonBodyText lines={1} />
                </Box>
              </BlockStack>
            </Box>
          }>
          <VariantsDisplay
            attributes={attributes}
            onAddVariant={showAttributeSelector}
            onAddOption={addOptionToAttribute}
            onRemoveOption={removeOptionFromAttribute}
            onAddCustomOption={addCustomOptionToAttribute}
            onRemoveVariant={handleRemoveVariant}
          />
        </Suspense>

        {showSelector && (
          <Suspense
            fallback={
              <Box padding="400">
                <BlockStack gap="400">
                  <SkeletonDisplayText size="small" />
                  <SkeletonBodyText lines={3} />
                  <Box paddingBlockStart="400">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </BlockStack>
              </Box>
            }>
            <SimpleAttributeSelector
              onSelectVariant={(variantName: string) => {
                handleSelectVariant(variantName);
                hideAttributeSelector();
              }}
              onCreateCustom={() => {
                handleCreateCustom();
                hideAttributeSelector();
              }}
              onDelete={() => {
                // Eliminar la última variante vacía si existe
                const lastIndex = attributes.length - 1;
                if (lastIndex >= 0) {
                  handleRemoveVariant(lastIndex);
                }
                hideAttributeSelector();
              }}
              showDeleteButton={true}
            />
          </Suspense>
        )}
      </BlockStack>
    );
  }

  return null;
}
