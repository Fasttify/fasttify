import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './auth'
import { cookiesClient } from '@/utils/amplify-utils'

/**
 * Middleware para proteger las rutas de tienda
 * Verifica que el usuario tenga acceso a la tienda solicitada
 */
export async function handleStoreAccessMiddleware(request: NextRequest) {
  // Obtener la sesión del usuario
  const session = await getSession(request, NextResponse.next())
  // Verificar autenticación
  if (!session || !session.tokens) {
    console.log('Usuario no autenticado, redirigiendo a login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Obtener el ID del usuario desde la sesión
  const userId = session.tokens?.idToken?.payload?.['cognito:username']

  if (!userId) {
    console.log('No se pudo obtener el ID del usuario, redirigiendo a login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Extraer el ID de la tienda de la URL
  const path = request.nextUrl.pathname
  const storeIdMatch = path.match(/\/store\/([^\/]+)/)

  if (!storeIdMatch || !storeIdMatch[1]) {
    console.log('No se pudo extraer el ID de la tienda, redirigiendo a my-store')
    return NextResponse.redirect(new URL('/my-store', request.url))
  }

  const requestedStoreId = storeIdMatch[1]

  try {
    // Verificar si la tienda pertenece al usuario
    const { data: stores } = await cookiesClient.models.UserStore.list({
      filter: {
        userId: { eq: userId as string },
        storeId: { eq: requestedStoreId },
      },
      selectionSet: ['storeId'],
      authMode: 'userPool',
    })

    // Si la tienda no pertenece al usuario, redirigir a my-store
    if (!stores || stores.length === 0) {
      console.log('La tienda no pertenece al usuario, redirigiendo a my-store')
      return NextResponse.redirect(new URL('/my-store', request.url))
    }

    // Si todo está bien, permitir el acceso
    console.log('Acceso permitido a la tienda')
    return NextResponse.next()
  } catch (error) {
    console.error('Error verificando acceso a tienda:', error)
    return NextResponse.redirect(new URL('/my-store', request.url))
  }
}
