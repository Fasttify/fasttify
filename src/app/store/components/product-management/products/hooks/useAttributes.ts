import { useCallback } from 'react';
import { DefaultVariantOption } from '../data/default-variants';

export interface Attribute {
  name?: string;
  values?: string[];
}

export interface UseAttributesProps {
  attributes: Attribute[];
  onChange: (value: Attribute[]) => void;
}

export function useAttributes({ attributes, onChange }: UseAttributesProps) {
  // Agregar nueva opción a un atributo específico
  const addOptionToAttribute = useCallback(
    (attributeIndex: number, option: DefaultVariantOption) => {
      const newAttributes = [...attributes];
      const currentAttribute = newAttributes[attributeIndex];

      if (!currentAttribute.values?.includes(option.value)) {
        currentAttribute.values = [...(currentAttribute.values || []), option.value];
        onChange(newAttributes);
      }
    },
    [attributes, onChange]
  );

  // Remover opción de un atributo específico
  const removeOptionFromAttribute = useCallback(
    (attributeIndex: number, optionValue: string) => {
      const newAttributes = [...attributes];
      const currentAttribute = newAttributes[attributeIndex];

      currentAttribute.values = currentAttribute.values?.filter((val) => val !== optionValue) || [];
      onChange(newAttributes);
    },
    [attributes, onChange]
  );

  // Agregar opción personalizada a un atributo específico
  const addCustomOptionToAttribute = useCallback(
    (attributeIndex: number, customValue: string) => {
      const newAttributes = [...attributes];
      const currentAttribute = newAttributes[attributeIndex];

      if (!currentAttribute.values?.includes(customValue)) {
        currentAttribute.values = [...(currentAttribute.values || []), customValue];
        onChange(newAttributes);
      }
    },
    [attributes, onChange]
  );

  // Crear nuevo atributo
  const createAttribute = useCallback(
    (name: string) => {
      const newAttributes = [...attributes, { name, values: [] }];
      onChange(newAttributes);
    },
    [attributes, onChange]
  );

  // Remover atributo
  const removeAttribute = useCallback(
    (index: number) => {
      const newAttributes = attributes.filter((_, i) => i !== index);
      onChange(newAttributes);
    },
    [attributes, onChange]
  );

  // Buscar atributo por nombre
  const findAttributeByName = useCallback(
    (name: string) => {
      return attributes.find((attr) => attr.name === name);
    },
    [attributes]
  );

  return {
    addOptionToAttribute,
    removeOptionFromAttribute,
    addCustomOptionToAttribute,
    createAttribute,
    removeAttribute,
    findAttributeByName,
  };
}
