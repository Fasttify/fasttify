import { normalizeAttributesField, normalizeTagsField } from '@/app/store/hooks/utils/productUtils';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from 'aws-amplify/auth';
import type { IProduct, ProductCreateInput, ProductUpdateInput } from '../types';
import { useProductCacheUtils } from '../utils';
import { generateProductSlug } from '@/lib/utils/slug';
import { ensureUniqueSlug } from '@/app/store/hooks/data/useProducts/utils/slugUnique';
import { client } from '@/lib/clients/amplify-client';

/**
 * Hook para manejar todas las mutaciones de productos
 */
export const useProductMutations = (storeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { invalidateProductCache, invalidateMultipleProductsCache } = useCacheInvalidation();
  const cacheUtils = useProductCacheUtils(storeId);

  /**
   * Mutación para crear un producto
   */
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductCreateInput) => {
      const { username } = await getCurrentUser();

      // Generar slug automáticamente si no se proporciona
      let slug = productData.slug;
      if (!slug && productData.name) {
        slug = generateProductSlug(productData.name);
      }

      // Asegurar unicidad estilo Shopify
      if (storeId && slug) {
        slug = await ensureUniqueSlug(storeId, slug);
      }

      const dataToSend = {
        ...productData,
        slug,
        attributes: normalizeAttributesField(
          productData.attributes as string | { name?: string; values?: string[] }[] | undefined
        ),
        tags: normalizeTagsField(productData.tags as string[] | string | undefined),
        storeId: storeId || '',
        owner: username,
        status: productData.status || 'DRAFT',
        quantity: productData.quantity || 0,
        nameLowercase: productData.name?.toLowerCase(),
      };

      const { data } = await client.models.Product.create(dataToSend);
      return data as IProduct;
    },
    onSuccess: async (newProduct) => {
      // Agregar el nuevo producto al caché de React Query
      cacheUtils.addProductToCache(newProduct);

      // Invalidar caché del motor de renderizado
      if (storeId) {
        await invalidateProductCache(storeId);
      }
    },
  });

  /**
   * Mutación para actualizar un producto
   */
  const updateProductMutation = useMutation({
    mutationFn: async (productData: ProductUpdateInput) => {
      // Si cambió name/slug, recalcular slug único excluyendo el propio id
      let nextSlug = productData.slug;
      if (!nextSlug && (productData as any).name) {
        nextSlug = generateProductSlug((productData as any).name as string);
      }
      if (storeId && nextSlug) {
        nextSlug = await ensureUniqueSlug(storeId, nextSlug, productData.id);
      }

      const dataToSend = {
        ...productData,
        ...(nextSlug ? { slug: nextSlug } : {}),
        attributes: normalizeAttributesField(
          productData.attributes as string | { name?: string; values?: string[] }[] | undefined
        ),
        tags: normalizeTagsField(productData.tags as string[] | string | undefined),
        nameLowercase: (productData as any).name?.toLowerCase(),
      };

      const { data } = await client.models.Product.update(dataToSend);
      return data as IProduct;
    },
    onSuccess: async (updatedProduct) => {
      // Actualizar caché de React Query
      cacheUtils.updateProductInCache(updatedProduct);

      // Invalidar caché del motor de renderizado
      if (storeId) {
        await invalidateProductCache(storeId, updatedProduct.id);
      }
    },
  });

  /**
   * Mutación para eliminar un producto
   */
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.models.Product.delete({ id });
      return id;
    },
    onSuccess: async (deletedId) => {
      // Remover producto de la caché de React Query
      cacheUtils.removeProductsFromCache([deletedId]);

      // Invalidar caché del motor de renderizado
      if (storeId) {
        await invalidateProductCache(storeId, deletedId);
      }
    },
  });

  /**
   * Mutación para eliminar múltiples productos usando batch delete (máximo 25 por lote)
   */
  const deleteMultipleProductsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const batchSize = 25;
      const deletedIds: string[] = [];

      // Procesar en lotes de 25 (límite de DynamoDB)
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const result = await client.mutations.BatchDeleteProducts({
          productIds: batch,
        });

        // Agregar los IDs procesados al resultado
        if (result.data) {
          deletedIds.push(...(result.data.map((item) => item?.id).filter(Boolean) as string[]));
        }
      }

      return deletedIds;
    },
    onSuccess: async (deletedIds) => {
      // Remover productos de la caché de React Query
      cacheUtils.removeProductsFromCache(deletedIds);

      // Invalidar todas las queries de productos para refrescar la paginación (sin await)
      queryClient.invalidateQueries({
        queryKey: ['products', storeId],
      });

      // Invalidar caché del motor de renderizado para múltiples productos (en background)
      if (storeId && deletedIds.length > 0) {
        invalidateMultipleProductsCache(storeId, deletedIds);
      }
    },
  });

  /**
   * Mutación para duplicar un producto
   */
  const duplicateProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: originalProduct } = await client.models.Product.get({ id });
      if (!originalProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const { username } = await getCurrentUser();

      // Generar slug para el producto duplicado
      const duplicatedName = `${originalProduct.name} (Copia)`;
      let duplicatedSlug = generateProductSlug(duplicatedName);
      duplicatedSlug = await ensureUniqueSlug(originalProduct.storeId, duplicatedSlug);

      // Crear una copia del producto sin campos que se generan automáticamente
      const duplicatedProduct = {
        storeId: originalProduct.storeId,
        name: duplicatedName,
        nameLowercase: duplicatedName.toLowerCase(),
        description: originalProduct.description,
        price: originalProduct.price,
        compareAtPrice: originalProduct.compareAtPrice,
        costPerItem: originalProduct.costPerItem,
        sku: originalProduct.sku ? `${originalProduct.sku}-copy` : undefined,
        barcode: originalProduct.barcode,
        quantity: 0,
        category: originalProduct.category,
        images: originalProduct.images,
        attributes: originalProduct.attributes,
        status: 'active',
        slug: duplicatedSlug,
        featured: false,
        tags: originalProduct.tags,
        variants: originalProduct.variants,
        collectionId: originalProduct.collectionId,
        supplier: originalProduct.supplier,
        owner: username,
      };

      const { data } = await client.models.Product.create(duplicatedProduct);
      return data as IProduct;
    },
    onSuccess: async (duplicatedProduct) => {
      // Agregar el producto duplicado al caché de React Query
      cacheUtils.addProductToCache(duplicatedProduct);

      // Invalidar caché del motor de renderizado
      if (storeId) {
        await invalidateProductCache(storeId);
      }
    },
  });

  return {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    deleteMultipleProductsMutation,
    duplicateProductMutation,
  };
};
