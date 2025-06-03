import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../auth/auth'
import { cookiesClient } from '@/utils/AmplifyUtils'

/**
 * Middleware para proteger las rutas de tienda
 * Verifica que el usuario tenga acceso a la tienda solicitada y un plan de suscripción válido
 */
export async function handleStoreAccessMiddleware(request: NextRequest) {
  // Obtener la sesión del usuario
  const session = await getSession(request, NextResponse.next())
  // Verificar autenticación
  if (!session || !session.tokens) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar plan de suscripción válido ANTES de verificar acceso a tienda
  const userPlan: string | undefined = session.tokens?.idToken?.payload?.['custom:plan'] as
    | string
    | undefined
  const allowedPlans = ['Royal', 'Majestic', 'Imperial']

  if (!userPlan || !allowedPlans.includes(userPlan)) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  // Obtener el ID del usuario desde la sesión
  const userId = session.tokens?.idToken?.payload?.['cognito:username']

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Extraer el ID de la tienda de la URL
  const path = request.nextUrl.pathname
  const storeIdMatch = path.match(/\/store\/([^\/]+)/)

  if (!storeIdMatch || !storeIdMatch[1]) {
    return NextResponse.redirect(new URL('/my-store', request.url))
  }

  const requestedStoreId = storeIdMatch[1]

  try {
    // Verificar si la tienda pertenece al usuario
    const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByUserId(
      {
        userId: userId as string,
      },
      {
        filter: {
          storeId: { eq: requestedStoreId },
        },
        selectionSet: ['storeId'],
      }
    )

    // Si la tienda no pertenece al usuario, redirigir a my-store
    if (!stores || stores.length === 0) {
      return NextResponse.redirect(new URL('/my-store', request.url))
    }

    // Si todo está bien (plan válido y tienda pertenece al usuario), permitir el acceso
    return NextResponse.next()
  } catch (error) {
    console.error('Error verificando acceso a tienda:', error)
    return NextResponse.redirect(new URL('/my-store', request.url))
  }
}
