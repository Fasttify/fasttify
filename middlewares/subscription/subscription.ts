import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/middlewares/auth/auth';

export async function handleSubscriptionMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response);

  if (!session) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  const userPlan: string | undefined = session.tokens?.idToken?.payload?.['custom:plan'] as string | undefined;
  const allowedPlans = ['Royal', 'Majestic', 'Imperial'];

  if (!userPlan || !allowedPlans.includes(userPlan)) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  return response;
}
