import { Liquid } from 'liquidjs';
import { ecommerceFilters } from '@fasttify/liquid-forge/liquid/filters/ecommerce-filters';

describe('Ecommerce Filters - Image Optimization', () => {
  let liquid: Liquid;

  beforeEach(() => {
    liquid = new Liquid();
    ecommerceFilters.forEach((filter) => {
      liquid.registerFilter(filter.name, filter.filter);
    });
  });

  describe('img_url filter', () => {
    it('should handle legacy size parameter', async () => {
      const template = `{{ 'https://example.com/image.jpg' | img_url: '600x800' }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('https://example.com/image.jpg?size=600x800');
    });

    it('should handle format, width, height parameters', async () => {
      const template = `{{ 'https://example.com/image.jpg' | img_url: 'webp', 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('https://example.com/image.jpg?format=webp&width=600&height=800');
    });

    it('should handle only width and height', async () => {
      const template = `{{ 'https://example.com/image.jpg' | img_url: 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('https://example.com/image.jpg?width=600&height=800');
    });

    it('should handle object parameters', async () => {
      const template = `{{ 'https://example.com/image.jpg' | img_url: params }}`;
      const context = {
        params: { width: 600, height: 800, format: 'auto' },
      };
      const result = await liquid.parseAndRender(template, context);

      expect(result).toBe('https://example.com/image.jpg?format=auto&width=600&height=800');
    });

    it('should handle full URLs', async () => {
      const template = `{{ 'https://example.com/image.jpg' | img_url: 'webp', 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('https://example.com/image.jpg?format=webp&width=600&height=800');
    });

    it('should handle empty URLs', async () => {
      const template = `{{ '' | img_url: 'webp', 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('');
    });
  });

  describe('image_url filter', () => {
    it('should handle legacy size parameter', async () => {
      const template = `{{ 'image.jpg' | image_url: '600x800' }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('/images/image.jpg?size=600x800');
    });

    it('should handle format, width, height parameters', async () => {
      const template = `{{ 'image.jpg' | image_url: 'webp', 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('/images/image.jpg?format=webp&width=600&height=800');
    });

    it('should handle only width and height', async () => {
      const template = `{{ 'image.jpg' | image_url: 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('/images/image.jpg?width=600&height=800');
    });

    it('should handle object parameters', async () => {
      const template = `{{ 'image.jpg' | image_url: params }}`;
      const context = {
        params: { width: 600, height: 800, format: 'auto' },
      };
      const result = await liquid.parseAndRender(template, context);

      expect(result).toBe('/images/image.jpg?format=auto&width=600&height=800');
    });

    it('should handle full URLs', async () => {
      const template = `{{ 'https://example.com/image.jpg' | image_url: 'webp', 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('https://example.com/image.jpg?format=webp&width=600&height=800');
    });

    it('should handle empty URLs', async () => {
      const template = `{{ '' | image_url: 'webp', 600, 800 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle product image with WebP optimization', async () => {
      const template = `{{ product.featured_image | img_url: 'webp', 600, 800 }}`;
      const context = {
        product: {
          featured_image: 'https://cdn.example.com/product-image.jpg',
        },
      };
      const result = await liquid.parseAndRender(template, context);

      expect(result).toBe('https://cdn.example.com/product-image.jpg?format=webp&width=600&height=800');
    });

    it('should handle collection image with auto format', async () => {
      const template = `{{ collection.image | image_url: params }}`;
      const context = {
        collection: {
          image: 'collection-banner.jpg',
        },
        params: { width: 400, height: 300, format: 'auto' },
      };
      const result = await liquid.parseAndRender(template, context);

      expect(result).toBe('/images/collection-banner.jpg?format=auto&width=400&height=300');
    });

    it('should handle external image URLs', async () => {
      const template = `{{ 'https://cdn.example.com/image.jpg' | img_url: 'webp', 500, 500 }}`;
      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('https://cdn.example.com/image.jpg?format=webp&width=500&height=500');
    });
  });
});
