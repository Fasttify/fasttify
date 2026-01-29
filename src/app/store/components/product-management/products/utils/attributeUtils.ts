import { DefaultVariantOption } from '../data/default-variants';
import { Attribute } from '../hooks/useAttributes';

/**
 * Utilidades para manejar atributos de productos
 */

export function createAttributeWithOption(name: string, option: DefaultVariantOption): Attribute {
  return {
    name,
    values: [option.value],
  };
}

export function addOptionToAttribute(attribute: Attribute, option: DefaultVariantOption): Attribute {
  const values = attribute.values || [];
  if (!values.includes(option.value)) {
    return {
      ...attribute,
      values: [...values, option.value],
    };
  }
  return attribute;
}

export function removeOptionFromAttribute(attribute: Attribute, optionValue: string): Attribute {
  return {
    ...attribute,
    values: (attribute.values || []).filter((val) => val !== optionValue),
  };
}

export function addCustomOptionToAttribute(attribute: Attribute, customValue: string): Attribute {
  const values = attribute.values || [];
  if (!values.includes(customValue)) {
    return {
      ...attribute,
      values: [...values, customValue],
    };
  }
  return attribute;
}

export function findAttributeIndexByName(attributes: Attribute[], name: string): number {
  return attributes.findIndex((attr) => attr.name === name);
}

export function hasAttributeWithName(attributes: Attribute[], name: string): boolean {
  return attributes.some((attr) => attr.name === name);
}
