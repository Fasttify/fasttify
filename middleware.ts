import { NextRequest, NextResponse } from 'next/server'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { runWithAmplifyServerContext } from '@/utils/amplify-utils'

/**
 * Obtiene la sesión del usuario dentro del contexto de Amplify.
 */
async function getSession(request: NextRequest, response: NextResponse) {
  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async contextSpec => {
      try {
        const session = await fetchAuthSession(contextSpec, {})
        return session.tokens !== undefined ? session : null
      } catch (error) {
        console.error('Error fetching user session:', error)
        return null
      }
    },
  })
}

/**
 * Middleware para verificar si el usuario tiene un plan válido para acceder a /subscription-success.
 */
async function handleSubscriptionMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response)

  if (!session) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  const userPlan: string | undefined = session.tokens?.idToken?.payload?.['custom:plan'] as
    | string
    | undefined

  const allowedPlans = ['Royal', 'Majestic', 'Imperial']

  if (!userPlan || !allowedPlans.includes(userPlan)) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  return response
}

/**
 * Middleware para verificar si el usuario está autenticado antes de acceder a /account-settings.
 */
async function handleAuthenticationMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response)

  if (!session) {
    console.warn('🔒 Usuario no autenticado, redirigiendo a /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

/**
 * Middleware principal que dirige la solicitud al middleware correspondiente según la ruta.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  if (path === '/subscription-success') {
    return handleSubscriptionMiddleware(request, response)
  }

  if (path === '/account-settings') {
    return handleAuthenticationMiddleware(request, response)
  }

  return response
}

/**
 * Configuración del middleware para definir las rutas protegidas.
 */
export const config = {
  matcher: ['/subscription-success', '/account-settings'],
}
