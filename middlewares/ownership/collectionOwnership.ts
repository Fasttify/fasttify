import { NextRequest, NextResponse } from 'next/server'
import { cookiesClient } from '@/utils/AmplifyUtils'
import { getSession } from '@/middlewares/auth/auth'

/**
 * Middleware para verificar que un usuario solo pueda acceder a colecciones
 * que pertenecen a la tienda que está visualizando actualmente.
 *
 * Este middleware realiza las siguientes verificaciones:
 * 1. Comprueba si el usuario está autenticado
 * 2. Verifica que el usuario tenga acceso a la tienda (como propietario o colaborador)
 * 3. Para colecciones existentes, verifica que pertenezcan a la tienda actual
 * 4. Permite acceso a la ruta "new" si el usuario tiene acceso a la tienda
 *
 * @param request - La solicitud HTTP entrante
 * @returns Respuesta HTTP apropiada según la verificación de propiedad
 */
export async function handleCollectionOwnershipMiddleware(request: NextRequest) {
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
    const redirectUrl = new URL('/my-store', request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('x-redirect-check', 'true')
    return response
  }

  try {
    // Verificar que el usuario tenga acceso a la tienda
    const storeResult = await cookiesClient.models.UserStore.get({
      storeId: currentStoreId,
    })

    // Si la tienda no existe o no pertenece al usuario, verificar si es colaborador
    if (!storeResult.data || storeResult.data.userId !== userId) {
      const userStoreResult = await cookiesClient.models.UserStore.listUserStoreByUserId(
        {
          userId: userId,
        },
        {
          filter: {
            storeId: { eq: currentStoreId },
          },
        }
      )

      if (!userStoreResult.data || userStoreResult.data.length === 0) {
        const redirectUrl = new URL('/my-store', request.url)
        const response = NextResponse.redirect(redirectUrl)
        response.headers.set('x-redirect-check', 'true')
        return response
      }
    }

    // Extraer el ID de la colección de la URL
    const collectionMatches = path.match(/\/collections\/([^\/]+)$/)
    const collectionId = collectionMatches ? collectionMatches[1] : null

    // Si es la ruta "new", permitir el acceso
    if (collectionId === 'new') {
      return NextResponse.next()
    }

    // Si no hay ID de colección o es una ruta especial, permitir el acceso
    if (!collectionId) {
      return NextResponse.next()
    }

    // Para colecciones existentes, verificar que pertenezcan a la tienda actual
    const { data: collection } = await cookiesClient.models.Collection.get({
      id: collectionId,
    })

    if (!collection) {
      const redirectUrl = new URL(
        `/store/${currentStoreId}/products/collections`,
        request.url
      )
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-redirect-check', 'true')
      return response
    }

    if (collection.storeId !== currentStoreId) {
      const redirectUrl = new URL(
        `/store/${currentStoreId}/products/collections`,
        request.url
      )
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-redirect-check', 'true')
      return response
    }

    return NextResponse.next()
  } catch (error) {
    const redirectUrl = new URL(`/my-store`, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('x-redirect-check', 'true')
    return response
  }
}
