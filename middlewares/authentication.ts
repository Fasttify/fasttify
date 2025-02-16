import { NextRequest, NextResponse } from 'next/server'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { runWithAmplifyServerContext } from '@/utils/amplify-utils'

export async function authenticationMiddleware(request: NextRequest) {
  const response = NextResponse.next()

  const session = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async contextSpec => {
      try {
        return await fetchAuthSession(contextSpec, {})
      } catch (error) {
        console.error('Error fetching user session:', error)
        return null
      }
    },
  })

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
