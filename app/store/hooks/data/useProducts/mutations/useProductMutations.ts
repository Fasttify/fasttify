import type { Schema } from '@/amplify/data/resource';
import { normalizeAttributesField, normalizeTagsField, withLowercaseName } from '@/app/store/hooks/utils/productUtils';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { IProduct, ProductCreateInput, ProductUpdateInput } from '../types';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar todas las mutaciones de productos
 */
export const useProductMutations = (storeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { invalidateProductCache } = useCacheInvalidation();

  /**
   * Mutación para crear un producto
   */
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductCreateInput) => {
      const { username } = await getCurrentUser();
      const dataToSend = withLowercaseName({
        ...productData,
        attributes: normalizeAttributesField(
          productData.attributes as string | { name?: string; values?: string[] }[] | undefined
        ),
        tags: normalizeTagsField(productData.tags as string[] | string | undefined),
        storeId: storeId || '',
        owner: username,
        status: productData.status || 'DRAFT',
        quantity: productData.quantity || 0,
      });

      const { data } = await client.models.Product.create(dataToSend);
      return data as IProduct;
    },
    onSuccess: async () => {
      // Invalidar React Query cache
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });

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
      const dataToSend = withLowercaseName({
        ...productData,
        attributes: normalizeAttributesField(
          productData.attributes as string | { name?: string; values?: string[] }[] | undefined
        ),
        tags: normalizeTagsField(productData.tags as string[] | string | undefined),
      });

      const { data } = await client.models.Product.update(dataToSend);
      return data as IProduct;
    },
    onSuccess: async (updatedProduct) => {
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
      // Invalidar caché del motor de renderizado
      if (storeId) {
        await invalidateProductCache(storeId, deletedId);
      }
    },
  });

  /**
   * Mutación para eliminar múltiples productos
   */
  const deleteMultipleProductsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => client.models.Product.delete({ id })));
      return ids;
    },
    onSuccess: async (deletedIds) => {
      // Invalidar caché del motor de renderizado para cada producto eliminado
      if (storeId) {
        await Promise.all(deletedIds.map((id) => invalidateProductCache(storeId, id)));
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

      // Crear una copia del producto sin campos que se generan automáticamente
      const duplicatedProduct = withLowercaseName({
        storeId: originalProduct.storeId,
        name: `${originalProduct.name} (Copia)`,
        nameLowercase: `${originalProduct.name} (copia)`.toLowerCase(),
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
        slug: originalProduct.slug ? `${originalProduct.slug}-copy` : undefined,
        featured: false,
        tags: originalProduct.tags,
        variants: originalProduct.variants,
        collectionId: originalProduct.collectionId,
        supplier: originalProduct.supplier,
        owner: username,
      });

      const { data } = await client.models.Product.create(duplicatedProduct);
      return data as IProduct;
    },
    onSuccess: async () => {
      // Invalidar React Query cache
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });

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
