import { cacheManager } from '@fasttify/liquid-forge/services/core/cache';

describe('CacheManager (node-cache integration)', () => {
  beforeEach(() => {
    cacheManager.clearCache();
  });

  it('debe guardar y obtener valores con setCached/getCached', () => {
    const key = 'test_store_1_key';
    const value = { foo: 'bar' };
    cacheManager.setCached(key, value, 5000);
    const cached = cacheManager.getCached(key);
    expect(cached).toEqual(value);
  });

  it('deleteByPrefix debe eliminar todas las claves con el prefijo', () => {
    cacheManager.setCached('test_store_1_a', 1, 5000);
    cacheManager.setCached('test_store_1_b', 2, 5000);
    cacheManager.setCached('other_store_2_c', 3, 5000);

    const deleted = cacheManager.deleteByPrefix('test_store_1_');
    expect(deleted).toBeGreaterThanOrEqual(2);
    expect(cacheManager.getCached('test_store_1_a')).toBeNull();
    expect(cacheManager.getCached('test_store_1_b')).toBeNull();
    expect(cacheManager.getCached('other_store_2_c')).toBe(3);
  });

  it('invalidateProductCache debe eliminar claves relacionadas a productos por prefijo', () => {
    const storeId = 's1';
    const productId = 'p1';
    cacheManager.setCached(`product_${storeId}_${productId}`, { id: productId }, 5000);
    cacheManager.setCached(`products_${storeId}_10_first`, { items: [] }, 5000);
    cacheManager.setCached(`featured_products_${storeId}_8`, { items: [] }, 5000);
    cacheManager.setCached(`product_${storeId}_p2`, { id: 'p2' }, 5000);

    cacheManager.invalidateProductCache(storeId, productId);

    expect(cacheManager.getCached(`product_${storeId}_${productId}`)).toBeNull();
    expect(cacheManager.getCached(`products_${storeId}_10_first`)).toBeNull();
    expect(cacheManager.getCached(`featured_products_${storeId}_8`)).toBeNull();
    // otra clave de producto no afectada si no comparte prefijo completo
    expect(cacheManager.getCached(`product_${storeId}_p2`)).not.toBeNull();
  });

  it('invalidateDomainCache debe eliminar clave específica de dominio', () => {
    const domain = 'example.fasttify.com';
    const key = `domain_${domain}`;
    cacheManager.setCached(key, { storeId: 's1' }, 5000);
    cacheManager.invalidateDomainCache(domain);
    expect(cacheManager.getCached(key)).toBeNull();
  });

  it('getCacheStats debe reflejar el número total/activo', () => {
    cacheManager.setCached('stats_a', 1, 5000);
    cacheManager.setCached('stats_b', 2, 5000);
    const stats = cacheManager.getCacheStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.active).toBeGreaterThanOrEqual(1);
  });
});
