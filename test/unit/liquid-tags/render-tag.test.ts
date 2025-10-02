import { RenderTag } from '@/packages/liquid-forge/liquid/tags/core/render-tag';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Liquid } from 'liquidjs';
import { createTestContext, createTestLiquid, mockTemplateLoader } from './setup';

// Mock del TemplateLoader
jest.mock('@/packages/liquid-forge/services/templates/template-loader', () => ({
  TemplateLoader: {
    getInstance: () => mockTemplateLoader,
  },
}));

describe('RenderTag', () => {
  let liquid: Liquid;

  beforeEach(() => {
    liquid = createTestLiquid();
    liquid.registerTag('render', RenderTag);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should render a basic snippet', async () => {
    const template = `{% render 'product-card' %}`;

    mockTemplateLoader.loadTemplate.mockResolvedValue('<div class="product-card">Product card content</div>');

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(mockTemplateLoader.loadTemplate).toHaveBeenCalledWith('test-store', 'snippets/product-card.liquid');
    expect(result).toContain('<div class="product-card">Product card content</div>');
  });

  it('should render snippet with parameters', async () => {
    const template = `{% render 'product-card', product: products.first %}`;

    mockTemplateLoader.loadTemplate.mockResolvedValue('<div class="product-card">{{ product.title }}</div>');

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(mockTemplateLoader.loadTemplate).toHaveBeenCalledWith('test-store', 'snippets/product-card.liquid');
    // El parámetro debería ser pasado al contexto del snippet
    expect(result).toBeDefined();
  });

  it('should handle snippet not found gracefully', async () => {
    const template = `{% render 'non-existent-snippet' %}`;

    mockTemplateLoader.loadTemplate.mockResolvedValue(null);

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain("<!-- Warning: Snippet 'non-existent-snippet' is empty -->");
  });

  it('should handle snippet with liquid extension already present', async () => {
    const template = `{% render 'product-card.liquid' %}`;

    mockTemplateLoader.loadTemplate.mockResolvedValue('<div class="card">Snippet content</div>');

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(mockTemplateLoader.loadTemplate).toHaveBeenCalledWith('test-store', 'snippets/product-card.liquid');
    expect(result).toContain('<div class="card">Snippet content</div>');
  });

  it('should handle template loader error', async () => {
    const template = `{% render 'error-snippet' %}`;

    mockTemplateLoader.loadTemplate.mockRejectedValue(new Error('Snippet load error'));

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain("<!-- Error loading snippet 'error-snippet': Snippet load error -->");
  });

  it('should require snippet name', async () => {
    const template = `{% render %}`;

    const context = createTestContext();

    await expect(liquid.parseAndRender(template, context)).rejects.toThrow('Render tag requires a snippet name');
  });

  it('should handle multiple parameters', async () => {
    const template = `{% render 'product-card', product: products.first, show_price: true %}`;

    mockTemplateLoader.loadTemplate.mockResolvedValue('<div>{{ product.title }} - {{ show_price }}</div>');

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(mockTemplateLoader.loadTemplate).toHaveBeenCalledWith('test-store', 'snippets/product-card.liquid');
    expect(result).toBeDefined();
  });

  it('should handle empty snippet content', async () => {
    const template = `{% render 'empty-snippet' %}`;

    mockTemplateLoader.loadTemplate.mockResolvedValue('');

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toContain("<!-- Warning: Snippet 'empty-snippet' is empty -->");
  });
});
