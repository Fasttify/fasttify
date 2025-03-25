import { NextRequest, NextResponse } from 'next/server'
import { cookiesClient } from '@/utils/amplify-utils'
import { getSession } from './auth'

/**
 * Middleware para verificar que un usuario solo pueda acceder a productos
 * que pertenecen a la tienda que está visualizando actualmente.
 *
 * Este middleware realiza las siguientes verificaciones:
 * 1. Comprueba si el usuario está autenticado
 * 2. Verifica que el usuario tenga acceso a la tienda (como propietario o colaborador)
 * 3. Para productos existentes, verifica que pertenezcan a la tienda actual
 * 4. Permite acceso a la ruta "new" si el usuario tiene acceso a la tienda
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

  // Verificar autenticación del usuario
  const session = await getSession(request, NextResponse.next())

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userId = session.tokens?.idToken?.payload?.['cognito:username']

  if (!userId || typeof userId !== 'string') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Extraer información de la URL
  const path = request.nextUrl.pathname
  const storeIdMatch = path.match(/\/store\/([^\/]+)/)
  const storeIdFromUrl = storeIdMatch ? storeIdMatch[1] : null
  const currentStoreId = request.cookies.get('currentStore')?.value || storeIdFromUrl

  if (!currentStoreId) {
    // Redirigir a la selección de tienda si no se puede determinar la tienda actual
    const redirectUrl = new URL('/my-store', request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('x-redirect-check', 'true')
    return response
  }

  try {
    // Verificar que el usuario tenga acceso a la tienda
    // Primero intentamos verificar si es propietario
    const storeResult = await cookiesClient.models.UserStore.get(
      {
        id: currentStoreId,
      },
      {
        authMode: 'userPool',
      }
    )

    // Si la tienda no existe o no pertenece al usuario, verificar si es colaborador
    if (!storeResult.data || storeResult.data.userId !== userId) {
      // Intentar verificar acceso a través de UserStore (para colaboradores)
      const userStoreResult = await cookiesClient.models.UserStore.list({
        filter: {
          storeId: {
            eq: currentStoreId,
          },
          userId: {
            eq: userId,
          },
        },
        authMode: 'userPool',
      })

      // Si no hay registros de UserStore, el usuario no tiene acceso
      if (!userStoreResult.data || userStoreResult.data.length === 0) {
        const redirectUrl = new URL('/my-store', request.url)
        const response = NextResponse.redirect(redirectUrl)
        response.headers.set('x-redirect-check', 'true')
        return response
      }
    }

    // Extraer el ID del producto de la URL
    const productMatches = path.match(/\/products\/([^\/]+)/)
    const productId = productMatches ? productMatches[1] : null

    // Si es la ruta "new", permitir el acceso (ya verificamos que el usuario tiene acceso a la tienda)
    if (productId === 'new') {
      return NextResponse.next()
    }

    if (!productId) {
      return NextResponse.next()
    }

    // Para productos existentes, verificar que pertenezcan a la tienda actual
    const { data: product } = await cookiesClient.models.Product.get(
      {
        id: productId,
      },
      {
        authMode: 'userPool',
      }
    )

    // Verificar que el producto exista y pertenezca a la tienda actual
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
    // Error al verificar el producto o la tienda, redirigir por seguridad
    const redirectUrl = new URL(`/my-store`, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('x-redirect-check', 'true')
    return response
  }
}
