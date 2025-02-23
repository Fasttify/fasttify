import { NextRequest, NextResponse } from 'next/server'
import { cookiesClient } from '@/utils/amplify-utils'
import { getSession } from './auth'

async function hasValidPlan(session: any) {
  const userPlan = session.tokens?.idToken?.payload?.['custom:plan'] as string | undefined
  const allowedPlans = ['Royal', 'Majestic', 'Imperial']
  return userPlan && allowedPlans.includes(userPlan)
}

async function hasExistingStores(userId: string) {
  try {
    const { data: stores } = await cookiesClient.models.UserStore.list({
      authMode: 'userPool',
      filter: { userId: { eq: userId } },
    })

    return stores && stores.length > 0
  } catch (error) {
    console.error('Error checking stores:', error)
    return false
  }
}

export async function handleStoreMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response)
  const path = request.nextUrl.pathname

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userId = session.tokens?.idToken?.payload?.['cognito:username']
  const hasValidSubscription = await hasValidPlan(session)
  const hasStores = await hasExistingStores(userId as string)

  if (path === '/first-steps') {
    if (!hasValidSubscription) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
    if (hasStores) {
      return NextResponse.redirect(new URL('/my-store', request.url))
    }
  }

  if (path === '/my-store') {
    if (!hasStores) {
      return NextResponse.redirect(new URL('/first-steps', request.url))
    }
    if (!hasValidSubscription) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  return response
}
