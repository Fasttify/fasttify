import { Liquid } from 'liquidjs';
import type { RenderContext } from '@/packages/renderer-engine/types/template';

// Crear contexto de prueba simple
export const createTestContext = (customData: Partial<RenderContext> = {}): RenderContext => {
  return {
    shop: {
      name: 'Test Store',
      currency: 'USD',
      domain: 'test-store.com',
      url: 'https://test-store.com',
      description: 'Test store description',
      money_format: '${{amount}}',
      theme: 'test-theme',
      storeId: 'test-store',
    },
    store: {
      name: 'Test Store',
      currency: 'USD',
      domain: 'test-store.com',
      url: 'https://test-store.com',
      description: 'Test store description',
      money_format: '${{amount}}',
      theme: 'test-theme',
      storeId: 'test-store',
    },
    page: {
      title: 'Test Page',
      url: '/',
      template: 'index',
      handle: 'homepage',
    },
    products: [
      {
        storeId: 'test-store',
        name: 'Test Product',
        description: 'Test product description',
        url: '/products/test-product',
        id: '1',
        title: 'Test Product',
        price: 2999,
        slug: 'test-product',
        featured_image: 'https://example.com/image.jpg',
        compare_at_price: 3999,
        images: [],
        variants: [],
        attributes: [],
        quantity: 1,
        status: 'active',
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
      },
    ],
    collections: [
      {
        id: '1',
        storeId: 'test-store',
        title: 'Test Collection',
        description: 'Test collection description',
        slug: 'test-collection',
        url: '/collections/test-collection',
        image: 'https://example.com/image.jpg',
        isActive: true,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
        owner: 'test-owner',
        sortOrder: 1,
        products: [],
      },
    ],
    storeId: 'test-store',
    page_title: 'Test Page',
    page_description: 'Test page description',
    ...customData,
  };
};

// Crear instancia de Liquid para testing
export const createTestLiquid = (): Liquid => {
  const liquid = new Liquid({
    root: './template',
    extname: '.liquid',
  });
  return liquid;
};

// Mock para TemplateLoader
export const mockTemplateLoader = {
  loadTemplate: jest.fn().mockResolvedValue('<div>Mock Template</div>'),
  hasTemplates: jest.fn().mockResolvedValue(true),
  loadMainLayout: jest.fn().mockResolvedValue('<html><body>{{ content_for_layout }}</body></html>'),
};
