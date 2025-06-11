import { IProduct } from '@/app/store/hooks/useProducts'
import { ProductFormValues } from '@/lib/zod-schemas/product-schema'

/**
 * Mapea un producto a los valores del formulario
 * @param product Producto a mapear
 * @returns Valores del formulario
 */
export function mapProductToFormValues(product: IProduct): Partial<ProductFormValues> {
  return {
    name: product.name,
    description: product.description ?? undefined,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    costPerItem: product.costPerItem,
    sku: product.sku ?? undefined,
    barcode: product.barcode ?? undefined,
    quantity: product.quantity ?? undefined,
    category: product.category ?? undefined,
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    attributes:
      typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes,
    variants:
      typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants,
    tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
    status: (product.status ?? undefined) as
      | 'active'
      | 'draft'
      | 'inactive'
      | 'pending'
      | undefined,
  }
}

/**
 * Prepara los datos del producto para enviar al servidor
 * @param data Datos del formulario
 * @param storeId ID de la tienda
 * @returns Datos del producto preparados
 */
export function prepareProductData(data: ProductFormValues, storeId: string): Record<string, any> {
  const basicProductData: Record<string, any> = {
    storeId,
    name: data.name,
    description: data.description,
    price: data.price,
    compareAtPrice: data.compareAtPrice,
    costPerItem: data.costPerItem,
    sku: data.sku,
    barcode: data.barcode,
    quantity: data.quantity,
    category: data.category,
    status: data.status,
  }

  // Convertimos los campos complejos a strings JSON
  basicProductData.images = JSON.stringify(data.images || [])
  basicProductData.attributes = JSON.stringify(data.attributes || [])
  basicProductData.variants = JSON.stringify(data.variants || [])
  basicProductData.tags = JSON.stringify(data.tags || [])

  return basicProductData
}

/**
 * Actualiza un producto existente
 * @param productData Datos del producto
 * @param productId ID del producto
 * @param storeId ID de la tienda
 * @param updateProductFn Función para actualizar el producto
 * @returns Producto actualizado o null
 */
export async function handleProductUpdate(
  productData: Record<string, any>,
  productId: string,
  storeId: string,
  updateProductFn: (data: any) => Promise<IProduct | null>
): Promise<IProduct | null> {
  if (!productId) {
    console.error('Cannot update product: No product ID provided')
    throw new Error('No se proporcionó un ID de producto')
  }

  try {
    const result = await updateProductFn({
      id: productId,
      ...productData,
      storeId: storeId,
    })

    if (!result) {
      console.error('Product update failed: No data returned')
      throw new Error('No se recibió respuesta al actualizar el producto')
    }

    return result
  } catch (error) {
    console.error('Error in handleProductUpdate:', error)

    throw error
  }
}

/**
 * Crea un nuevo producto
 * @param productData Datos del producto
 * @param createProductFn Función para crear el producto
 * @returns Producto creado o null
 */
export async function handleProductCreate(
  productData: Record<string, any>,
  createProductFn: (data: any) => Promise<IProduct | null>
): Promise<IProduct | null> {
  try {
    const result = await createProductFn(productData)

    if (result) {
      return result
    }

    throw new Error('The product could not be created')
  } catch (error) {
    console.error('Error in handleProductCreate:', error)

    throw error
  }
}
