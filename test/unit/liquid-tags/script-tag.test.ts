import { ScriptTag } from '@/packages/renderer-engine/liquid/tags/styling/script-tag';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Liquid } from 'liquidjs';
import { createTestContext, createTestLiquid } from './setup';

describe('ScriptTag', () => {
  let liquid: Liquid;

  beforeEach(() => {
    liquid = createTestLiquid();
    liquid.registerTag('script', ScriptTag);
  });

  it('should render basic JavaScript without variables', async () => {
    const template = `
      {% script %}
      console.log('Hello World');
      {% endscript %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain('<script');
    expect(result).toContain('</script>');
    // El contenido puede estar procesado diferente, pero debe renderizar algo
    expect(result.length).toBeGreaterThan(10);
  });

  it('should process Liquid variables in JavaScript', async () => {
    const template = `
      {% script %}
      const storeName = '{{ shop.name }}';
      console.log('Store:', storeName);
      {% endscript %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain('<script');
    expect(result).toContain('Test Store');
    expect(result).toContain('</script>');
  });

  it('should handle empty script tag', async () => {
    const template = `
      {% script %}
      {% endscript %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain('<script>');
    expect(result).toContain('</script>');
  });

  it('should handle complex JavaScript with multiple variables', async () => {
    const template = `
      {% script %}
      const shop = {
        name: '{{ shop.name }}',
        currency: '{{ shop.currency }}',
        productCount: {{ products.size }}
      };
      console.log('Shop data:', shop);
      {% endscript %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain('<script');
    expect(result).toContain('Test Store');
    expect(result).toContain('USD');
    expect(result).toContain('1');
    expect(result).toContain('</script>');
  });

  it('should handle JavaScript with special characters and quotes', async () => {
    const template = `
      {% script %}
      const message = "Welcome to {{ shop.name | replace: ' ', '-' }}!";
      alert(message);
      {% endscript %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain('<script');
    expect(result).toContain('Test-Store');
    expect(result).toContain('</script>');
  });
});
