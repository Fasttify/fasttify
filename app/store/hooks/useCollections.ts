import { useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query'

const client = generateClient<Schema>()

// Clave base para las consultas de colecciones
const COLLECTIONS_KEY = 'collections'

/**
 * Interfaz para los datos de entrada de una colección
 */
export interface CollectionInput {
  storeId: string // ID de la tienda a la que pertenece la colección
  title: string // Título de la colección
  description?: string // Descripción opcional de la colección
  image?: string // URL de la imagen de la colección (opcional)
  products?: any[] // Array de productos en la colección (opcional)
  slug?: string // URL amigable para la colección (opcional)
  isActive: boolean // Indica si la colección está activa
  sortOrder?: number // Orden de clasificación (opcional)
  owner: string // Usuario propietario de la colección
}

/**
 * Hook personalizado para gestionar colecciones de productos con React Query
 *
 * Este hook proporciona funciones para crear, leer, actualizar y eliminar colecciones,
 * así como para gestionar los productos dentro de las colecciones.
 * Utiliza React Query para mantener los datos en caché durante 5 minutos.
 */
export const useCollections = () => {
  const [error, setError] = useState<any>(null) // Estado de error
  const queryClient = useQueryClient()

  /**
   * Función auxiliar para ejecutar operaciones con manejo de errores
   * @param operation - Función que realiza la operación con la API
   * @returns Los datos resultantes o null en caso de error
   */
  const performOperation = async <T>(
    operation: () => Promise<{ data: T; errors?: any[] }>
  ): Promise<T> => {
    setError(null)
    try {
      const result = await operation()
      if (result.errors && result.errors.length > 0) {
        setError(result.errors)
        throw new Error(result.errors[0].message || 'Error en la operación')
      }
      return result.data
    } catch (err) {
      setError(err)
      throw err
    }
  }

  /**
   * Obtiene una colección por su ID usando React Query
   * @param id - ID de la colección a obtener
   * @returns Resultado de la consulta con la colección
   */
  const useGetCollection = (id: string): UseQueryResult<any, Error> => {
    return useQuery({
      queryKey: [COLLECTIONS_KEY, id],
      queryFn: () =>
        performOperation(() => client.models.Collection.get({ id }, { authMode: 'userPool' })),
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!id,
    })
  }

  /**
   * Lista todas las colecciones, opcionalmente filtradas por tienda usando React Query
   * @param storeId - ID de la tienda para filtrar (opcional)
   * @returns Resultado de la consulta con el array de colecciones
   */
  const useListCollections = (storeId?: string): UseQueryResult<any[], Error> => {
    return useQuery({
      queryKey: [COLLECTIONS_KEY, 'list', storeId],
      queryFn: () => {
        const filter = storeId ? { storeId: { eq: storeId } } : undefined
        return performOperation(() =>
          client.models.Collection.list({
            filter,
            authMode: 'userPool',
          })
        )
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
    })
  }

  /**
   * Crea una nueva colección usando React Query
   */
  const useCreateCollection = () => {
    return useMutation({
      mutationFn: (collectionInput: CollectionInput) =>
        performOperation(() =>
          client.models.Collection.create(collectionInput, {
            authMode: 'userPool',
          })
        ),
      onSuccess: () => {
        // Invalidar consultas para actualizar la lista
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, 'list'] })
      },
    })
  }

  /**
   * Actualiza una colección existente usando React Query
   */
  const useUpdateCollection = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<CollectionInput> }) =>
        performOperation(() =>
          client.models.Collection.update(
            {
              id,
              ...data,
            },
            {
              authMode: 'userPool',
            }
          )
        ),
      onSuccess: data => {
        // Actualizar la colección en caché
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, data?.id] })
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, 'list'] })
      },
    })
  }

  /**
   * Elimina una colección usando React Query
   */
  const useDeleteCollection = () => {
    return useMutation({
      mutationFn: (id: string) =>
        performOperation(() => client.models.Collection.delete({ id }, { authMode: 'userPool' })),
      onSuccess: (_, id) => {
        // Eliminar la colección de la caché
        queryClient.removeQueries({ queryKey: [COLLECTIONS_KEY, id] })
        queryClient.invalidateQueries({ queryKey: [COLLECTIONS_KEY, 'list'] })
      },
    })
  }

  /**
   * Añade un producto a una colección
   * @param collectionId - ID de la colección
   * @param product - Datos del producto a añadir
   * @returns La colección actualizada o null en caso de error
   */
  const addProductToCollection = async (collectionId: string, product: any) => {
    // Obtener la colección actual de la caché o de la API
    const collection = await queryClient.fetchQuery({
      queryKey: [COLLECTIONS_KEY, collectionId],
      queryFn: () =>
        performOperation(() =>
          client.models.Collection.get({ id: collectionId }, { authMode: 'userPool' })
        ),
    })

    if (!collection) throw new Error('Colección no encontrada')

    // Obtenemos los productos actuales o inicializamos un array vacío
    const currentProducts = collection.products || []

    // Verificamos si el producto ya existe en la colección
    if (Array.isArray(currentProducts) && currentProducts.some((p: any) => p.id === product.id)) {
      return collection
    }

    // Añadimos el nuevo producto
    const updatedProducts = Array.isArray(currentProducts)
      ? [...currentProducts, product]
      : [product]

    // Actualizamos la colección
    const updateMutation = useUpdateCollection()
    return updateMutation.mutateAsync({
      id: collectionId,
      data: { products: updatedProducts },
    })
  }

  /**
   * Elimina un producto de una colección
   * @param collectionId - ID de la colección
   * @param productId - ID del producto a eliminar
   * @returns La colección actualizada o null en caso de error
   */
  const removeProductFromCollection = async (collectionId: string, productId: string) => {
    // Obtener la colección actual de la caché o de la API
    const collection = await queryClient.fetchQuery({
      queryKey: [COLLECTIONS_KEY, collectionId],
      queryFn: () =>
        performOperation(() =>
          client.models.Collection.get({ id: collectionId }, { authMode: 'userPool' })
        ),
    })

    if (!collection) throw new Error('Colección no encontrada')

    // Obtenemos los productos actuales o inicializamos un array vacío
    const currentProducts = collection.products || []

    // Filtramos el producto a eliminar
    const updatedProducts = Array.isArray(currentProducts)
      ? currentProducts.filter((p: any) => p.id !== productId)
      : []

    // Actualizamos la colección
    const updateMutation = useUpdateCollection()
    return updateMutation.mutateAsync({
      id: collectionId,
      data: { products: updatedProducts },
    })
  }

  return {
    error,
    useGetCollection,
    useListCollections,
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    addProductToCollection,
    removeProductFromCollection,
  }
}
