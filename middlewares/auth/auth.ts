import { runWithAmplifyServerContext } from '@/utils/client/AmplifyUtils';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function getSession(request: NextRequest, response: NextResponse) {
  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec, { forceRefresh: true });
        return session.tokens !== undefined ? session : null;
      } catch (error) {
        console.error('Error fetching user session:', error);
        return null;
      }
    },
  });
}

export async function handleAuthenticationMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export async function handleAuthenticatedRedirectMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response);

  if (session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
