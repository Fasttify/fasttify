import {
  getStoreUrl,
  getProductUrl,
  getCollectionUrl,
  getPageUrl,
  getHomeUrl,
  getCartUrl,
  getCheckoutUrl,
  getSearchUrl,
} from '@/lib/utils/store-url';

describe('store-url utilities', () => {
  const baseOptions = {
    storeId: 'test-store-123',
    customDomain: 'mi-tienda.com',
  };

  describe('getStoreUrl', () => {
    it('should generate URL with custom domain', () => {
      const url = getStoreUrl(baseOptions);
      expect(url).toBe('https://mi-tienda.com');
    });

    it('should generate URL with fallback domain when no custom domain', () => {
      const url = getStoreUrl({ storeId: 'test-store-123' });
      expect(url).toBe('https://test-store-123.fasttify.com');
    });

    it('should use custom protocol', () => {
      const url = getStoreUrl({ ...baseOptions, protocol: 'http' });
      expect(url).toBe('http://mi-tienda.com');
    });
  });

  describe('getProductUrl', () => {
    it('should generate product URL', () => {
      const url = getProductUrl({
        ...baseOptions,
        productSlug: 'camiseta-azul',
      });
      expect(url).toBe('https://mi-tienda.com/products/camiseta-azul');
    });
  });

  describe('getCollectionUrl', () => {
    it('should generate collection URL', () => {
      const url = getCollectionUrl({
        ...baseOptions,
        collectionSlug: 'ropa-deportiva',
      });
      expect(url).toBe('https://mi-tienda.com/collections/ropa-deportiva');
    });
  });

  describe('getPageUrl', () => {
    it('should generate page URL', () => {
      const url = getPageUrl({
        ...baseOptions,
        pageSlug: 'sobre-nosotros',
      });
      expect(url).toBe('https://mi-tienda.com/pages/sobre-nosotros');
    });
  });

  describe('getHomeUrl', () => {
    it('should generate home URL', () => {
      const url = getHomeUrl(baseOptions);
      expect(url).toBe('https://mi-tienda.com');
    });
  });

  describe('getCartUrl', () => {
    it('should generate cart URL', () => {
      const url = getCartUrl(baseOptions);
      expect(url).toBe('https://mi-tienda.com/cart');
    });
  });

  describe('getCheckoutUrl', () => {
    it('should generate checkout URL', () => {
      const url = getCheckoutUrl(baseOptions);
      expect(url).toBe('https://mi-tienda.com/checkout');
    });
  });

  describe('getSearchUrl', () => {
    it('should generate search URL without query', () => {
      const url = getSearchUrl(baseOptions);
      expect(url).toBe('https://mi-tienda.com/search');
    });

    it('should generate search URL with query', () => {
      const url = getSearchUrl({
        ...baseOptions,
        query: 'camiseta azul',
      });
      expect(url).toBe('https://mi-tienda.com/search?q=camiseta%20azul');
    });
  });
});
