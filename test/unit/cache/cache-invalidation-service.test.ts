jest.mock('@fasttify/liquid-forge/services/core/cache/cache-manager', () => {
  const original = jest.requireActual('@fasttify/liquid-forge/services/core/cache/cache-manager');
  return {
    ...original,
    cacheManager: {
      deleteByPrefix: jest.fn(),
      deleteKey: jest.fn(),
      invalidateStoreCache: jest.fn(),
      invalidateProductCache: jest.fn(),
    },
  };
});

import { cacheInvalidationService, cacheManager } from '@fasttify/liquid-forge/services/core/cache';

describe('CacheInvalidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe invalidar por patrones al crear producto', () => {
    cacheInvalidationService.invalidateCache('product_created', 's1');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('products_s1_');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('featured_products_s1_');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('search_products_s1_');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('collection_s1_');
  });

  it('debe invalidar claves específicas y prefijos al actualizar producto', () => {
    cacheInvalidationService.invalidateCache('product_updated', 's1', 'p1');
    expect(cacheManager.deleteKey).toHaveBeenCalledWith('product_s1_p1');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('products_s1_');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('featured_products_s1_');
  });

  it('debe invalidar colecciones por prefijo', () => {
    cacheInvalidationService.invalidateCache('collection_deleted', 's1', 'c1');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('collection_s1_c1_');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('collections_s1_');
  });

  it('debe invalidar páginas por clave y listado', () => {
    cacheInvalidationService.invalidateCache('page_updated', 's1', 'pg1');
    expect(cacheManager.deleteKey).toHaveBeenCalledWith('page_s1_pg1');
    expect(cacheManager.deleteKey).toHaveBeenCalledWith('pages_s1');
  });

  it('debe invalidar navegación por prefijos', () => {
    cacheInvalidationService.invalidateCache('navigation_updated', 's1');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('navigation_s1');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('navigation_menu_s1_');
  });

  it('debe invalidar templates por prefijo', () => {
    cacheInvalidationService.invalidateCache('template_updated', 's1');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('template_s1_');
    expect(cacheManager.deleteByPrefix).toHaveBeenCalledWith('compiled_template_s1_');
  });

  it('debe invalidar dominio por clave cuando se provee entityId', () => {
    cacheInvalidationService.invalidateCache('domain_updated', 's1', 'example.fasttify.com');
    expect(cacheManager.deleteKey).toHaveBeenCalledWith('domain_example.fasttify.com');
  });
});
