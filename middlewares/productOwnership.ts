import { NextRequest, NextResponse } from 'next/server'
import { cookiesClient } from '@/utils/amplify-utils'
import { getSession } from './auth'

/**
 * Middleware para verificar que un usuario solo pueda acceder a productos
 * que pertenecen a la tienda que está visualizando actualmente.
 *
 * @param request - La solicitud HTTP entrante
 * @returns Respuesta HTTP apropiada según la verificación de propiedad
 */
export async function handleProductOwnershipMiddleware(request: NextRequest) {
  // Verificar si esta es una redirección para evitar bucles
  const isRedirect = request.headers.get('x-redirect-check') === 'true'
  if (isRedirect) {
    return NextResponse.next()
  }

  const session = await getSession(request, NextResponse.next())

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userId = session.tokens?.idToken?.payload?.['cognito:username']

  if (!userId || typeof userId !== 'string') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Extraer el ID del producto de la URL
  const path = request.nextUrl.pathname

  // Extraer el ID de la tienda de la URL
  const storeIdMatch = path.match(/\/store\/([^\/]+)/)
  const storeIdFromUrl = storeIdMatch ? storeIdMatch[1] : null

  // Extraer el ID del producto de la URL
  const productMatches = path.match(/\/products\/([^\/]+)/)
  const productId = productMatches ? productMatches[1] : null

  // Si es la ruta "new", permitir el acceso (es para crear un nuevo producto)
  if (productId === 'new') {
    return NextResponse.next()
  }

  if (!productId) {
    return NextResponse.next()
  }

  // Obtener el ID de la tienda actual desde la cookie o la URL
  const currentStoreId = request.cookies.get('currentStore')?.value || storeIdFromUrl

  if (!currentStoreId) {
    // Redirigir a la selección de tienda si no se puede determinar la tienda actual
    const redirectUrl = new URL('/my-store', request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('x-redirect-check', 'true')
    return response
  }

  try {
    // Verificar si el producto existe
    const { data: product } = await cookiesClient.models.Product.get(
      {
        id: productId,
      },
      {
        authMode: 'userPool',
      }
    )

    // Verificar que el producto pertenezca específicamente a la tienda actual
    if (!product) {
      // El producto no existe, redirigir a la lista de productos
      const redirectUrl = new URL(`/store/${currentStoreId}/products`, request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-redirect-check', 'true')
      return response
    }

    if (product.storeId !== currentStoreId) {
      // El producto pertenece a otra tienda, denegar acceso
      const redirectUrl = new URL(`/store/${currentStoreId}/products`, request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-redirect-check', 'true')
      return response
    }

    // El producto pertenece a la tienda actual, continuar con la solicitud
    return NextResponse.next()
  } catch (error) {
    // Error al verificar el producto, redirigir por seguridad
    const redirectUrl = new URL(`/store/${currentStoreId}/products`, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('x-redirect-check', 'true')
    return response
  }
}
