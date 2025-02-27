import { NextRequest, NextResponse } from 'next/server'
import { handleAuthenticationMiddleware, handleAuthenticatedRedirect } from './middlewares/auth'
import { handleSubscriptionMiddleware } from './middlewares/subscription'
import { handleStoreMiddleware } from './middlewares/store'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  if (path === '/login') {
    return handleAuthenticatedRedirect(request, response)
  }

  if (path === '/subscription-success') {
    return handleSubscriptionMiddleware(request, response)
  }

  if (path === '/account-settings') {
    return handleAuthenticationMiddleware(request, response)
  }

  if (['/first-steps', '/my-store'].includes(path)) {
    return handleStoreMiddleware(request, response)
  }

  return response
}

export const config = {
  matcher: ['/login', '/subscription-success', '/account-settings', '/first-steps', '/my-store'],
}
