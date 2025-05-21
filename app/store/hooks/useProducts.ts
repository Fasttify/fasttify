import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>({
  authMode: 'userPool',
})

/**
 * Interfaz para representar un producto
 */
export interface IProduct {
  id: string
  storeId: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  costPerItem?: number
  sku?: string
  barcode?: string
  quantity: number
  category?: string
  images?: Array<{
    url: string
    alt?: string
    position?: number
  }>
  attributes?: Array<{
    name: string
    values: string[]
  }>
  status: 'active' | 'inactive' | 'pending' | 'draft'
  slug?: string
  featured?: boolean
  tags?: string[]
  variants?: Array<{
    id: string
    name: string
    price?: number
    sku?: string
    quantity?: number
    attributes?: Array<{
      name: string
      value: string
    }>
    images?: Array<{
      url: string
      alt?: string
    }>
  }>
  owner: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Tipo para los datos necesarios al crear un producto
 */
export type ProductCreateInput = Omit<IProduct, 'id' | 'owner'>

/**
 * Tipo para los datos al actualizar un producto
 */
export type ProductUpdateInput = Partial<Omit<IProduct, 'id' | 'owner'>> & {
  id: string
}

/**
 * Opciones para filtrar productos
 */
export interface ProductFilterOptions {
  category?: string
  featured?: boolean
  status?: 'active' | 'inactive' | 'pending' | 'draft'
  priceRange?: { min?: number; max?: number }
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  limit?: number
  sortDirection?: 'ASC' | 'DESC'
  sortField?: keyof IProduct
}

/**
 * Resultado del hook useProducts
 */
export interface UseProductsResult {
  products: IProduct[]
  loading: boolean
  paginationLoading: boolean
  error: Error | null
  currentPage: number
  hasNextPage: boolean
  loadNextPage: () => void
  resetPagination: () => void
  createProduct: (productData: ProductCreateInput) => Promise<IProduct | null>
  updateProduct: (productData: ProductUpdateInput) => Promise<IProduct | null>
  deleteProduct: (id: string) => Promise<boolean>
  deleteMultipleProducts: (ids: string[]) => Promise<boolean>
  refreshProducts: () => void
  fetchProduct: (id: string) => Promise<IProduct | null>
  isFetchingNextPage: boolean
}

/**
 * Opciones de paginación y configuración
 */
export interface UseProductsOptions extends PaginationOptions {
  skipInitialFetch?: boolean
  enabled?: boolean
}

/**
 * Hook para gestionar productos con paginación y caché usando React Query
 * @param storeId - ID de la tienda para la que se gestionan los productos
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con productos, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useProducts(
  storeId: string | undefined,
  options?: UseProductsOptions
): UseProductsResult {
  const queryClient = useQueryClient()

  // Valores por defecto para paginación
  const limit = options?.limit || 60
  const sortDirection = options?.sortDirection || 'DESC'
  const sortField = options?.sortField || 'creationDate'
  const enabled = options?.enabled !== false && !!storeId

  // Función para obtener productos con paginación
  const fetchProductsPage = async ({ pageParam = null }: { pageParam: string | null }) => {
    if (!storeId) throw new Error('Store ID is required')

    const { data, nextToken } = await client.models.Product.listProductByStoreId(
      {
        storeId: storeId,
      },
      {
        limit,
        nextToken: pageParam,
      }
    )

    // Ordenamos manualmente los resultados
    const sortedData = [...(data || [])].sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a]
      const fieldB = b[sortField as keyof typeof b]

      // Manejar valores undefined o null
      if (fieldA === undefined || fieldA === null) return sortDirection === 'ASC' ? -1 : 1
      if (fieldB === undefined || fieldB === null) return sortDirection === 'ASC' ? 1 : -1

      // Comparación estándar
      if (fieldA < fieldB) return sortDirection === 'ASC' ? -1 : 1
      if (fieldA > fieldB) return sortDirection === 'ASC' ? 1 : -1
      return 0
    })

    return {
      products: sortedData as IProduct[],
      nextToken: nextToken as string | null,
      page: pageParam ? 'next' : 'first',
    }
  }
  // Consulta infinita para productos con paginación
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error: queryError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', storeId, limit, sortDirection, sortField],
    queryFn: fetchProductsPage,
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => lastPage.nextToken as string | null,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Mutación para crear un producto
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductCreateInput) => {
      const { username } = await getCurrentUser()

      const { data } = await client.models.Product.create({
        ...productData,
        storeId: storeId || '',
        owner: username,
        status: productData.status || 'DRAFT',
        quantity: productData.quantity || 0,
      })

      return data as IProduct
    },
    onSuccess: newProduct => {
      // Invalidar la caché para que se actualice
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })

      // Opcionalmente, actualizar la caché directamente
      queryClient.setQueryData(
        ['products', storeId, limit, sortDirection, sortField],
        (oldData: any) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData

          // Añadir el nuevo producto a la primera página
          const newPages = [...oldData.pages]
          newPages[0] = {
            ...newPages[0],
            products: [newProduct, ...newPages[0].products].slice(0, limit),
          }

          return {
            ...oldData,
            pages: newPages,
          }
        }
      )
    },
  })

  // Mutación para actualizar un producto
  const updateProductMutation = useMutation({
    mutationFn: async (productData: ProductUpdateInput) => {
      const { data } = await client.models.Product.update(productData)
      return data as IProduct
    },
    onSuccess: updatedProduct => {
      // Actualizar la caché directamente
      queryClient.setQueryData(
        ['products', storeId, limit, sortDirection, sortField],
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData

          // Actualizar el producto en todas las páginas
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            products: page.products.map((p: IProduct) =>
              p.id === updatedProduct.id ? updatedProduct : p
            ),
          }))

          return {
            ...oldData,
            pages: newPages,
          }
        }
      )
    },
  })

  // Mutación para eliminar un producto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.models.Product.delete({ id })
      return id
    },
    onSuccess: deletedId => {
      // Actualizar la caché directamente
      queryClient.setQueryData(
        ['products', storeId, limit, sortDirection, sortField],
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData

          // Eliminar el producto de todas las páginas
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            products: page.products.filter((p: IProduct) => p.id !== deletedId),
          }))

          return {
            ...oldData,
            pages: newPages,
          }
        }
      )
    },
  })

  // Mutación para eliminar múltiples productos
  const deleteMultipleProductsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => client.models.Product.delete({ id })))
      return ids
    },
    onSuccess: deletedIds => {
      // Actualizar la caché directamente
      queryClient.setQueryData(
        ['products', storeId, limit, sortDirection, sortField],
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData

          // Eliminar los productos de todas las páginas
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            products: page.products.filter((p: IProduct) => !deletedIds.includes(p.id)),
          }))

          return {
            ...oldData,
            pages: newPages,
          }
        }
      )
    },
  })

  // Consulta para obtener un producto específico
  const fetchProductById = async (id: string): Promise<IProduct | null> => {
    if (!storeId) {
      console.error('Cannot get product: storeId not defined')
      return null
    }

    // Primero verificamos si ya tenemos el producto en la caché
    const cachedProducts = queryClient.getQueryData([
      'products',
      storeId,
      limit,
      sortDirection,
      sortField,
    ]) as any

    if (cachedProducts && cachedProducts.pages) {
      for (const page of cachedProducts.pages) {
        const existingProduct = page.products.find((p: IProduct) => p.id === id)
        if (existingProduct) {
          // Verificar que el producto pertenezca a la tienda actual
          if (existingProduct.storeId === storeId) {
            return existingProduct
          } else {
            console.error(
              `Access denied: Product ${id} does not belong to the current store ${storeId}`
            )
            return null
          }
        }
      }
    }

    // Verificar si el producto pertenece a la tienda actual antes de hacer la petición
    try {
      // Primero obtenemos todos los productos de la tienda actual
      const { data: storeProducts } = await client.models.Product.list({
        filter: { storeId: { eq: storeId } },
      })

      // Buscamos el producto en los productos de la tienda
      const productInStore = storeProducts?.find(p => p.id === id)

      if (productInStore) {
        // El producto pertenece a la tienda actual, lo añadimos a la caché
        queryClient.setQueryData(['product', id], productInStore)
        return productInStore as IProduct
      } else {
        // El producto no pertenece a la tienda actual o no existe
        console.error(
          `Access denied: Product ${id} does not belong to the current store ${storeId}`
        )
        return null
      }
    } catch (error) {
      console.error(`Error verifying product ${id}:`, error)
      return null
    }
  }

  // Extraer productos de todas las páginas
  const products = data?.pages.flatMap(page => page.products) || []

  // Calcular el número de página actual
  const currentPage = data?.pages.length || 1

  return {
    // Datos y estado
    products,
    loading: isFetching && !isFetchingNextPage,
    paginationLoading: isFetchingNextPage,
    error: queryError ? new Error(queryError.message) : null,

    // Información de paginación
    currentPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,

    // Funciones de paginación
    loadNextPage: fetchNextPage,
    resetPagination: () => refetch(),

    // Funciones CRUD
    createProduct: async productData => {
      try {
        return await createProductMutation.mutateAsync(productData)
      } catch (err) {
        console.error('Error creating product:', err)
        return null
      }
    },
    updateProduct: async productData => {
      try {
        return await updateProductMutation.mutateAsync(productData)
      } catch (err) {
        console.error('Error updating product:', err)
        return null
      }
    },
    deleteProduct: async id => {
      try {
        await deleteProductMutation.mutateAsync(id)
        return true
      } catch (err) {
        console.error('Error deleting product:', err)
        return false
      }
    },
    deleteMultipleProducts: async ids => {
      try {
        await deleteMultipleProductsMutation.mutateAsync(ids)
        return true
      } catch (err) {
        console.error('Error deleting multiple products:', err)
        return false
      }
    },
    fetchProduct: fetchProductById,
    refreshProducts: () => refetch(),
  }
}
