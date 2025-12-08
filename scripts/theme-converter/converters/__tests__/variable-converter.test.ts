/**
 * Tests básicos para VariableConverter
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { VariableConverter } from '../variable-converter';
import { ConversionContextManager } from '../../core/conversion-context';
import { ConversionConfigLoader } from '../../config/conversion-config';
import type { ConversionContext } from '../../types/conversion-types';

describe('VariableConverter', () => {
  let converter: VariableConverter;
  let context: ConversionContext;

  beforeEach(() => {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/source', '/output', config.rules, false);
    context = contextManager.getContext();
    converter = new VariableConverter(context);
  });

  it('debería convertir product.vendor a product.category', () => {
    const content = '{{ product.vendor }}';
    const result = converter.convert(content);

    expect(result.convertedContent).toBe('{{ product.category }}');
    expect(result.transformations).toHaveLength(1);
    expect(result.transformations[0].original).toBe('{{ product.vendor }}');
    expect(result.transformations[0].converted).toBe('{{ product.category }}');
  });

  it('debería convertir product.handle a product.slug', () => {
    const content = '{{ product.handle }}';
    const result = converter.convert(content);

    expect(result.convertedContent).toBe('{{ product.slug }}');
    expect(result.transformations).toHaveLength(1);
  });

  it('debería mantener variables sin mapeo', () => {
    const content = '{{ product.title }}';
    const result = converter.convert(content);

    // product.title no tiene mapeo (es igual en ambos)
    expect(result.convertedContent).toBe('{{ product.title }}');
    expect(result.transformations).toHaveLength(0);
  });

  it('debería convertir variables con filtros', () => {
    const content = '{{ product.vendor | upcase }}';
    const result = converter.convert(content);

    expect(result.convertedContent).toBe('{{ product.category | upcase }}');
    expect(result.transformations).toHaveLength(1);
  });

  it('debería manejar múltiples variables en el mismo contenido', () => {
    const content = '{{ product.vendor }} y {{ product.handle }}';
    const result = converter.convert(content);

    expect(result.convertedContent).toBe('{{ product.category }} y {{ product.slug }}');
    expect(result.transformations).toHaveLength(2);
  });

  it('debería registrar issues para variables desconocidas', () => {
    const content = '{{ product.unknown_property }}';
    converter.convert(content);

    const issues = context.issues.filter((i) => i.message.includes('Variable no mapeada'));
    expect(issues.length).toBeGreaterThan(0);
  });
});
