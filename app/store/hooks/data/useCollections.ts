import type { Schema } from '@/data-schema';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import { useState } from 'react';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

// Clave base para las consultas de colecciones
const COLLECTIONS_KEY = 'collections';

/**
 * Interfaz para los datos de entrada de una colección
 */
export type Collection = Schema['Collection']['type'];
export type CollectionSummary = Pick<Collection, 'id' | 'title' | 'slug'>;
export interface CollectionInput {
  storeId: string; // ID de la tienda a la que pertenece la colección
  title: string; // Título de la colección
  description?: string; // Descripción opcional de la colección
  image?: string; // URL de la imagen de la colección (opcional)
  slug?: string; // URL amigable para la colección (opcional)
  isActive: boolean; // Indica si la colección está activa
  sortOrder?: number; // Orden de clasificación (opcional)
  owner: string; // Usuario propietario de la colección
}

/**
 * Hook personalizado para gestionar colecciones de productos con React Query
 *
 * Este hook proporciona funciones para crear, leer, actualizar y eliminar colecciones,
 * así como para gestionar los productos dentro de las colecciones.
 * Utiliza React Query para mantener los datos en caché durante 5 minutos.
 */
export const useCollections = () => {
  const [error, setError] = useState<any>(null); // Estado de error
  const queryClient = useQueryClient();
  const { invalidateCollectionCache } = useCacheInvalidation();

  /**
   * Función auxiliar para ejecutar operaciones con manejo de errores
   * @param operation - Función que realiza la operación con la API
   * @returns Los datos resultantes o null en caso de error
   */
  const performOperation = async <T>(operation: () => Promise<{ data: T; errors?: any[] }>): Promise<T> => {
    setError(null);
    try {
      const result = await operation();
      if (result.errors && result.errors.length > 0) {
        setError(result.errors);
        throw new Error(result.errors[0].message || 'Operation error');
      }
      return result.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Obtiene una colección por su ID usando React Query
   * @param id - ID de la colección a obtener
   * @returns Resultado de la consulta con la colección
   */
  const useGetCollection = (id: string): UseQueryResult<any, Error> => {
    return useQuery({
      queryKey: [COLLECTIONS_KEY, id],
      queryFn: () => {
        if (!id) {
          return null;
        }
        // Carga la colección y sus productos asociados en una sola consulta
        // utilizando 'selectionSet' para realizar Eager Loading.
        return performOperation(() =>
          client.models.Collection.get(
            { id },
            {
              selectionSet: ['id', 'title', 'description', 'image', 'slug', 'isActive', 'products.*'],
            }
          )
        );
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!id,
    });
  };

  /**
   * Lista todas las colecciones, opcionalmente filtradas por tienda usando React Query
   * @param storeId - ID de la tienda para filtrar (opcional)
   * @returns Resultado de la consulta con el array de colecciones
   */
  const useListCollections = (storeId?: string): UseQueryResult<any[], Error> => {
    return useQuery({
      queryKey: [COLLECTIONS_KEY, 'list', storeId],
      queryFn: () => {
        if (!storeId) {
          throw new Error('Store ID is required to list collections by store.');
        }

        return performOperation(() =>
          client.models.Collection.listCollectionByStoreId(
            {
              storeId: storeId,
            },
            {
              selectionSet: ['id', 'title', 'isActive'],
            }
          )
        );
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!storeId,
    });
  };

  const useListCollectionSummaries = (storeId?: string): UseQueryResult<CollectionSummary[], Error> => {
    return useQuery({
      queryKey: [COLLECTIONS_KEY, 'list', storeId, 'summary'],
      queryFn: () => {
        if (!storeId) {
          throw new Error('Store ID is required to list collection summaries.');
        }

        return performOperation(() =>
          client.models.Collection.listCollectionByStoreId({ storeId }, { selectionSet: ['id', 'title', 'slug'] })
        );
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!storeId,
    });
  };

  /**
   * Crea una nueva colección usando React Query
   */
  const useCreateCollection = () => {
    return useMutation({
      mutationFn: (collectionInput: CollectionInput) =>
        performOperation(() => client.models.Collection.create(collectionInput)),
      onSuccess: async (newCollection) => {
        // Invalidar consultas para actualizar la lista
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, 'list'] });

        // Invalidar caché del motor de renderizado
        if (newCollection?.storeId) {
          await invalidateCollectionCache(newCollection.storeId);
        }
      },
    });
  };

  /**
   * Actualiza una colección existente usando React Query
   */
  const useUpdateCollection = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<CollectionInput> }) => {
        if (!id) {
          throw new Error('Collection ID is required for update');
        }
        return performOperation(() =>
          client.models.Collection.update({
            id,
            ...data,
          })
        );
      },
      onSuccess: async (updatedCollection) => {
        // Actualizar la colección en caché
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, updatedCollection?.id] });
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, 'list'] });

        // Invalidar caché del motor de renderizado
        if (updatedCollection?.storeId) {
          await invalidateCollectionCache(updatedCollection.storeId, updatedCollection.id);
        }
      },
    });
  };

  /**
   * Elimina una colección usando React Query
   */
  const useDeleteCollection = () => {
    return useMutation({
      mutationFn: ({ id, storeId }: { id: string; storeId: string }) => {
        if (!id) {
          throw new Error('Collection ID is required for deletion');
        }
        if (!storeId) {
          throw new Error('Store ID is required for cache invalidation');
        }
        return performOperation(() => client.models.Collection.delete({ id }));
      },
      onSuccess: async (_, variables) => {
        // Eliminar la colección de la caché
        queryClient.removeQueries({ queryKey: [COLLECTIONS_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, 'list'] });

        // Invalidar caché del motor de renderizado
        await invalidateCollectionCache(variables.storeId, variables.id);
      },
    });
  };

  /**
   * Añade un producto a una colección
   * @param collectionId - ID de la colección
   * @param productId - ID del producto a añadir
   * @returns El producto actualizado o null en caso de error
   */
  const addProductToCollection = async (collectionId: string, productId: string) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }
    if (!productId) {
      throw new Error('Product ID is required');
    }
    // Actualizar el producto para asignarle la colección
    return performOperation(() =>
      client.models.Product.update({
        id: productId,
        collectionId: collectionId,
      })
    );
  };

  /**
   * Elimina un producto de una colección
   * @param productId - ID del producto a eliminar de la colección
   * @returns El producto actualizado o null en caso de error
   */
  const removeProductFromCollection = async (productId: string) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    // Actualizar el producto para eliminar la referencia a la colección
    return performOperation(() =>
      client.models.Product.update({
        id: productId,
        collectionId: null, // Eliminar la referencia a la colección
      })
    );
  };

  return {
    error,
    useGetCollection,
    useListCollections,
    useListCollectionSummaries,
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    addProductToCollection,
    removeProductFromCollection,
  };
};
