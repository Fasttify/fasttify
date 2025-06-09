import { Liquid } from 'liquidjs'
import type { RenderContext } from '../../../lib/store-renderer/types/template'

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
        id: 1,
        title: 'Test Product',
        price: 2999,
        handle: 'test-product',
        available: true,
        featured_image: {
          src: 'https://example.com/image.jpg',
          alt: 'Test product image',
          width: 800,
          height: 600,
        },
      },
    ],
    collections: [
      {
        id: 1,
        title: 'Test Collection',
        handle: 'test-collection',
      },
    ],
    storeId: 'test-store',
    page_title: 'Test Page',
    page_description: 'Test page description',
    ...customData,
  }
}

// Crear instancia de Liquid para testing
export const createTestLiquid = (): Liquid => {
  const liquid = new Liquid({
    root: './template',
    extname: '.liquid',
  })
  return liquid
}

// Mock para TemplateLoader
export const mockTemplateLoader = {
  loadTemplate: jest.fn().mockResolvedValue('<div>Mock Template</div>'),
  hasTemplates: jest.fn().mockResolvedValue(true),
  loadMainLayout: jest.fn().mockResolvedValue('<html><body>{{ content_for_layout }}</body></html>'),
}
