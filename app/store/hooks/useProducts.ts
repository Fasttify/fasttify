import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

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
}

/**
 * Opciones de paginación y configuración
 */
export interface UseProductsOptions extends PaginationOptions {
  skipInitialFetch?: boolean
}

/**
 * Hook para gestionar productos con paginación
 * @param storeId - ID de la tienda para la que se gestionan los productos
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con productos, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useProducts(
  storeId: string | undefined,
  options?: UseProductsOptions
): UseProductsResult {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Estado para paginación
  const [nextToken, setNextToken] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Valores por defecto para paginación
  const limit = options?.limit || 10
  const sortDirection = options?.sortDirection || 'DESC'
  const sortField = options?.sortField || 'creationDate'

  /**
   * Carga los productos de la tienda especificada con paginación
   */
  useEffect(() => {
    if (!storeId || options?.skipInitialFetch) {
      setLoading(false)
      return
    }

    fetchProductsPage(null)
  }, [storeId, limit, sortDirection, sortField])

  /**
   * Obtiene una página de productos
   * @param token - Token de paginación para obtener la siguiente página
   */
  const fetchProductsPage = async (token: string | null) => {
    if (!storeId) return

    try {
      setLoading(true)

      // La API de Amplify Gen 2 no tiene un parámetro de ordenación directo en list()
      // Usamos solo los parámetros básicos y ordenamos manualmente después
      const { data, nextToken: newNextToken } = await client.models.Product.list({
        filter: { storeId: { eq: storeId } },
        authMode: 'userPool',
        limit,
        nextToken: token,
      })

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

      if (token === null) {
        // Primera página o reinicio
        setProducts((sortedData as IProduct[]) || [])
      } else {
        // Agregar a la lista existente
        setProducts(prev => [...prev, ...((sortedData as IProduct[]) || [])])
      }

      setNextToken(newNextToken || null)
      setHasNextPage(!!newNextToken)

      if (token === null) {
        setCurrentPage(1)
      } else if (newNextToken) {
        setCurrentPage(prev => prev + 1)
      }
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar productos'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carga la siguiente página de productos
   */
  const loadNextPage = () => {
    if (hasNextPage && nextToken) {
      fetchProductsPage(nextToken)
    }
  }

  /**
   * Reinicia la paginación y carga la primera página
   */
  const resetPagination = () => {
    fetchProductsPage(null)
  }

  /**
   * Crea un nuevo producto
   * @param productData - Datos del producto a crear
   * @returns El producto creado o null si hay un error
   */
  const createProduct = async (productData: ProductCreateInput): Promise<IProduct | null> => {
    try {
      setLoading(true)

      // Obtener el usuario actual para asignarlo como propietario
      const { username } = await getCurrentUser()

      const { data } = await client.models.Product.create(
        {
          ...productData,
          storeId: storeId || '',
          owner: username,
          status: productData.status || 'DRAFT',
          quantity: productData.quantity || 0,
        },
        { authMode: 'userPool' }
      )

      if (data) {
        // Si estamos en la primera página, añadir el nuevo producto
        if (currentPage === 1) {
          setProducts(prev => [data as IProduct, ...prev].slice(0, limit))
        }

        return data as IProduct
      }
      return null
    } catch (err) {
      console.error('Error al crear producto:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al crear producto'))
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualiza un producto existente
   * @param productData - Datos del producto a actualizar (debe incluir id)
   * @returns El producto actualizado o null si hay un error
   */
  const updateProduct = async (productData: ProductUpdateInput): Promise<IProduct | null> => {
    try {
      setLoading(true)
      const { data } = await client.models.Product.update(productData, { authMode: 'userPool' })

      if (data) {
        // Actualizar el producto en la lista actual si existe
        setProducts(prev => prev.map(p => (p.id === data.id ? (data as IProduct) : p)))
        return data as IProduct
      }
      return null
    } catch (err) {
      console.error('Error al actualizar producto:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al actualizar producto'))
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Elimina un producto
   * @param id - ID del producto a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await client.models.Product.delete({ id }, { authMode: 'userPool' })

      // Eliminar el producto de la lista actual
      setProducts(prev => prev.filter(p => p.id !== id))

      return true
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al eliminar producto'))
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Elimina múltiples productos
   * @param ids - Arreglo de IDs de los productos a eliminar
   * @returns true si se eliminaron correctamente todos, false en caso de error
   */
  const deleteMultipleProducts = async (ids: string[]): Promise<boolean> => {
    try {
      setLoading(true)
      // Ejecutamos todas las peticiones de eliminación en paralelo
      await Promise.all(
        ids.map(id => client.models.Product.delete({ id }, { authMode: 'userPool' }))
      )

      // Actualizamos el estado eliminando los productos borrados
      setProducts(prev => prev.filter(p => !ids.includes(p.id)))

      return true
    } catch (err) {
      console.error('Error al eliminar múltiples productos:', err)
      setError(
        err instanceof Error ? err : new Error('Error desconocido al eliminar múltiples productos')
      )
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtiene un producto específico por su ID
   * @param id - ID del producto a obtener
   * @returns El producto obtenido o null si hay un error
   */
  const fetchProduct = async (id: string): Promise<IProduct | null> => {
    try {
      setLoading(true)

      // Primero verificamos si ya tenemos el producto en el estado
      const existingProduct = products.find(p => p.id === id)
      if (existingProduct) {
        return existingProduct
      }

      // Si no lo tenemos, lo buscamos en la API
      const { data } = await client.models.Product.get({ id }, { authMode: 'userPool' })

      if (data) {
        // Añadimos el producto al estado si no está ya
        setProducts(prev => {
          // Verificamos si ya existe en el array
          const exists = prev.some(p => p.id === data.id)
          if (!exists) {
            return [...prev, data as IProduct]
          }
          return prev
        })

        return data as IProduct
      }

      return null
    } catch (err) {
      console.error('Error al obtener producto:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al obtener producto'))
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    // Datos y estado
    products,
    loading,
    error,

    // Información de paginación
    currentPage,
    hasNextPage,

    // Funciones de paginación
    loadNextPage,
    resetPagination,

    // Funciones CRUD
    createProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    fetchProduct,

    // Otras funciones útiles
    refreshProducts: resetPagination,
  }
}
