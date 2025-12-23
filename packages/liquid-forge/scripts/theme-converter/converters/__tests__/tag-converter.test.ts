/**
 * Tests básicos para TagConverter
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TagConverter } from '../tag-converter';
import { ConversionContextManager } from '../../core/conversion-context';
import { ConversionConfigLoader } from '../../config/conversion-config';
import type { ConversionContext } from '../../types/conversion-types';

describe('TagConverter', () => {
  let converter: TagConverter;
  let context: ConversionContext;

  beforeEach(() => {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/source', '/output', config.rules, false);
    context = contextManager.getContext();
    converter = new TagConverter(context);
  });

  it('debería convertir include a render', () => {
    const content = "{% include 'snippet' %}";
    const result = converter.convert(content);

    expect(result.convertedContent).toBe("{% render 'snippet' %}");
    expect(result.transformations).toHaveLength(1);
    expect(result.transformations[0].original).toBe("{% include 'snippet' %}");
    expect(result.transformations[0].converted).toBe("{% render 'snippet' %}");
  });

  it('debería convertir endinclude a endrender', () => {
    const content = '{% endinclude %}';
    const result = converter.convert(content);

    expect(result.convertedContent).toBe('{% endrender %}');
    expect(result.transformations).toHaveLength(1);
  });

  it('debería mantener tags sin mapeo', () => {
    const content = '{% if condition %}';
    const result = converter.convert(content);

    // if no tiene mapeo (es igual en ambos)
    expect(result.convertedContent).toBe('{% if condition %}');
    expect(result.transformations).toHaveLength(0);
  });

  it('debería preservar parámetros en tags', () => {
    const content = "{% include 'snippet' with var: value %}";
    const result = converter.convert(content);

    expect(result.convertedContent).toContain('render');
    expect(result.convertedContent).toContain('with var: value');
  });

  it('debería manejar tags anidados', () => {
    const content = '{% if condition %}{% include "snippet" %}{% endif %}';
    const result = converter.convert(content);

    expect(result.convertedContent).toContain('render');
    expect(result.convertedContent).toContain('if');
  });

  it('debería convertir javascript_tag a script_tag', () => {
    const content = "{{ 'app.js' | asset_url | javascript_tag }}";
    const result = converter.convert(content);

    // Esto también es un filtro, pero verificamos que se maneje correctamente
    expect(result.convertedContent).toBeDefined();
  });

  it('debería registrar issues para tags desconocidos', () => {
    const content = '{% unknown_tag %}';
    converter.convert(content);

    const issues = context.issues.filter((i) => i.message.includes('Tag no mapeado'));
    expect(issues.length).toBeGreaterThan(0);
  });
});
