import { NextRequest, NextResponse } from 'next/server'
import { cookiesClient } from '@/utils/AmplifyUtils'
import { getSession } from '../auth/auth'

const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
}

async function hasValidPlan(session: any) {
  const userPlan = session.tokens?.idToken?.payload?.['custom:plan'] as string | undefined
  const allowedPlans = ['Royal', 'Majestic', 'Imperial']
  return userPlan && allowedPlans.includes(userPlan)
}

async function checkStoreLimit(userId: string, plan: string) {
  try {
    const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByUserId({
      userId: userId,
    })

    const storeCount = stores?.length || 0
    const limit = STORE_LIMITS[plan as keyof typeof STORE_LIMITS] || 0

    return {
      hasStores: storeCount > 0,
      canCreateMore: storeCount < limit,
      storeCount,
      limit,
    }
  } catch (error) {
    console.error('Error checking stores:', error)
    return { hasStores: false, canCreateMore: false, storeCount: 0, limit: 0 }
  }
}

export async function handleStoreMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response)
  const path = request.nextUrl.pathname

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userId = session.tokens?.idToken?.payload?.['cognito:username']
  const userPlan = session.tokens?.idToken?.payload?.['custom:plan']
  const hasValidSubscription = await hasValidPlan(session)

  if (!hasValidSubscription) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  const { hasStores, canCreateMore } = await checkStoreLimit(userId as string, userPlan as string)

  if (path === '/first-steps') {
    if (hasStores && !canCreateMore) {
      return NextResponse.redirect(new URL('/my-store', request.url))
    }
  }

  if (path === '/my-store') {
    if (!hasStores) {
      return NextResponse.redirect(new URL('/first-steps', request.url))
    }
  }

  return response
}
