import { logger } from '@/renderer-engine/lib/logger';
import { cacheManager } from '@/renderer-engine/services/core/cache-manager';
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import type { ProductAttribute, ProductContext, TemplateError } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

interface PaginationOptions {
  limit?: number;
  nextToken?: string;
}

interface ProductsResponse {
  products: ProductContext[];
  nextToken?: string | null;
}

export class ProductFetcher {
  /**
   * Obtiene productos de una tienda con paginación
   */
  public async getStoreProducts(storeId: string, options: PaginationOptions = {}): Promise<ProductsResponse> {
    try {
      const { limit = 20, nextToken } = options;
      const cacheKey = `products_${storeId}_${limit}_${nextToken || 'first'}`;
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as ProductsResponse;
      }

      const response = await cookiesClient.models.Product.listProductByStoreId(
        { storeId },
        {
          limit,
          nextToken,
          filter: {
            status: { eq: 'active' },
          },
        }
      );

      if (!response.data) {
        throw new Error(`No products found for store: ${storeId}`);
      }

      const products: ProductContext[] = response.data.map((product) => this.transformProduct(product));

      const result: ProductsResponse = {
        products,
        nextToken: response.nextToken,
      };

      cacheManager.setCached(cacheKey, result, cacheManager.getAppropiateTTL('product'));

      return result;
    } catch (error) {
      logger.error(`Error fetching products for store ${storeId}`, error, 'ProductFetcher');

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch products for store: ${storeId}`,
        details: error,
        statusCode: 500,
      };

      throw templateError;
    }
  }

  /**
   * Obtiene un producto específico por ID o por su handle (slug).
   */
  public async getProduct(storeId: string, productIdOrHandle: string): Promise<ProductContext | null> {
    try {
      const productCacheKey = `product_${storeId}_${productIdOrHandle}`;
      const cachedProduct = cacheManager.getCached(productCacheKey);
      if (cachedProduct) {
        return cachedProduct as ProductContext;
      }

      try {
        const { data: productById } = await cookiesClient.models.Product.get({
          id: productIdOrHandle,
        });
        if (productById && productById.storeId === storeId) {
          const transformed = this.transformProduct(productById);
          cacheManager.setCached(productCacheKey, transformed, cacheManager.getAppropiateTTL('product'));
          return transformed;
        }
      } catch (e) {}

      const handleMapCacheKey = `product_handle_map_${storeId}`;
      const handleMap = cacheManager.getCached(handleMapCacheKey);

      if (handleMap && handleMap[productIdOrHandle]) {
        const productId = handleMap[productIdOrHandle];
        return this.getProduct(storeId, productId);
      }

      const { data: allProducts } = await cookiesClient.models.Product.listProductByStoreId(
        { storeId },
        {
          filter: {
            status: { eq: 'active' },
          },
        }
      );

      if (!allProducts || allProducts.length === 0) {
        return null;
      }

      const newHandleMap: { [handle: string]: string } = {};
      let targetProduct: any = null;

      for (const p of allProducts) {
        const handle = dataTransformer.createHandle(p.name);
        newHandleMap[handle] = p.id;
        if (handle === productIdOrHandle) {
          targetProduct = p;
        }
      }

      cacheManager.setCached(handleMapCacheKey, newHandleMap, cacheManager.STORE_CACHE_TTL);

      if (!targetProduct) {
        return null;
      }

      const transformedProduct = this.transformProduct(targetProduct);
      cacheManager.setCached(productCacheKey, transformedProduct, cacheManager.getAppropiateTTL('product'));
      return transformedProduct;
    } catch (error) {
      logger.error(`Error fetching product "${productIdOrHandle}" for store ${storeId}`, error, 'ProductFetcher');
      return null;
    }
  }

  /**
   * Obtiene productos destacados de una tienda
   */
  public async getFeaturedProducts(storeId: string, limit: number = 8): Promise<ProductContext[]> {
    try {
      const cacheKey = `featured_products_${storeId}_${limit}`;
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as ProductContext[];
      }

      const response = await cookiesClient.models.Product.listProductByStoreId(
        { storeId },
        {
          limit,
          filter: {
            status: { eq: 'active' },
          },
        }
      );

      if (!response.data) {
        return [];
      }

      const products = response.data.map((product) => this.transformProduct(product));

      cacheManager.setCached(cacheKey, products, cacheManager.getAppropiateTTL('product'));

      return products;
    } catch (error) {
      logger.error(`Error fetching featured products for store ${storeId}`, error, 'ProductFetcher');
      return [];
    }
  }

  /**
   * Obtiene productos de una colección específica con paginación usando el índice secundario.
   */
  public async getProductsByCollection(
    storeId: string,
    collectionId: string,
    collectionHandle?: string,
    options: PaginationOptions = {}
  ): Promise<ProductsResponse> {
    try {
      const { limit = 20, nextToken } = options;

      const response = await cookiesClient.models.Product.listProductByCollectionId(
        {
          collectionId: collectionId,
        },
        {
          limit,
          nextToken: nextToken,
          filter: {
            status: { eq: 'active' },
          },
        }
      );

      const products = response.data.map((p) => this.transformProduct(p, collectionHandle));

      return {
        products,
        nextToken: response.nextToken,
      };
    } catch (error) {
      logger.error(`Error fetching products for collection ${collectionId}`, error, 'ProductFetcher');
      return { products: [], nextToken: null };
    }
  }

  /**
   * Transforma un producto al formato Liquid
   */
  public transformProduct(product: any, collectionHandle?: string): ProductContext {
    const handle = dataTransformer.createHandle(product.name);

    const price = dataTransformer.formatPrice(product.price || 0);
    const compareAtPrice = product.compareAtPrice ? dataTransformer.formatPrice(product.compareAtPrice) : undefined;
    const transformedImages = dataTransformer.transformImages(product.images, product.name);
    const variants = dataTransformer.transformVariants(product.variants, product.price);
    const attributes: ProductAttribute[] = dataTransformer.transformAttributes(product.attributes);
    const featured_image = transformedImages.length > 0 ? transformedImages[0].url : undefined;
    const images = transformedImages.map((img) => img.url || img);
    const url = collectionHandle ? `/collections/${collectionHandle}/products/${handle}` : `/products/${handle}`;

    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      title: product.name,
      slug: handle,
      attributes: attributes,
      featured_image: featured_image,
      quantity: product.quantity,
      description: product.description,
      price: price,
      compare_at_price: compareAtPrice,
      url: url,
      images: images,
      variants: variants,
      status: product.status,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

export const productFetcher = new ProductFetcher();
