/**
 * Tests básicos para FilterConverter
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { FilterConverter } from '../filter-converter';
import { ConversionContextManager } from '../../core/conversion-context';
import { ConversionConfigLoader } from '../../config/conversion-config';
import type { ConversionContext } from '../../types/conversion-types';

describe('FilterConverter', () => {
  let converter: FilterConverter;
  let context: ConversionContext;

  beforeEach(() => {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/source', '/output', config.rules, false);
    context = contextManager.getContext();
    converter = new FilterConverter(context);
  });

  it('debería convertir money_with_currency a money', () => {
    const content = '{{ price | money_with_currency }}';
    const result = converter.convert(content);

    expect(result.convertedContent).toBe('{{ price | money }}');
    expect(result.transformations).toHaveLength(1);
    expect(result.transformations[0].original).toBe('| money_with_currency');
    expect(result.transformations[0].converted).toBe('| money');
  });

  it('debería mantener filtros sin mapeo', () => {
    const content = '{{ price | money }}';
    const result = converter.convert(content);

    // money no tiene mapeo (es igual en ambos)
    expect(result.convertedContent).toBe('{{ price | money }}');
    expect(result.transformations).toHaveLength(0);
  });

  it('debería preservar parámetros de filtros', () => {
    const content = '{{ image | img_url: "800x600" }}';
    const result = converter.convert(content);

    // img_url se mantiene igual pero verificamos que los parámetros se preserven
    expect(result.convertedContent).toContain('img_url');
    expect(result.convertedContent).toContain('800x600');
  });

  it('debería manejar múltiples filtros encadenados', () => {
    const content = '{{ text | strip_html | truncate: 50 }}';
    const result = converter.convert(content);

    // Ambos filtros deberían estar presentes
    expect(result.convertedContent).toContain('strip_html');
    expect(result.convertedContent).toContain('truncate');
  });

  it('debería convertir asset_url especial dentro de svg-wrapper', () => {
    const content = '<span class="svg-wrapper">{{ "icon.svg" | asset_url }}</span>';
    const result = converter.convertSpecialAssetFilter(content);

    expect(result).toContain('inline_asset_content');
    expect(result).not.toContain('asset_url');
  });

  it('debería registrar issues para filtros desconocidos', () => {
    const content = '{{ value | unknown_filter }}';
    converter.convert(content);

    const issues = context.issues.filter((i) => i.message.includes('Filtro no mapeado'));
    expect(issues.length).toBeGreaterThan(0);
  });
});
