/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/middlewares/auth/auth';

export async function handleSubscriptionMiddleware(request: NextRequest, response: NextResponse) {
  // Usar cache para evitar múltiples forceRefresh en la misma request
  const session = await getSession(request, response, false);

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
