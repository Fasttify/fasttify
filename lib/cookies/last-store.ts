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

/**
 * Configuration for the last visited store cookie
 */
const LAST_STORE_COOKIE_CONFIG = {
  name: 'last-visited-store',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const;

/**
 * Sets the last visited store cookie with the given store ID
 *
 * @param response - NextResponse object to set the cookie on
 * @param storeId - The store ID to save as the last visited store
 * @returns The response with the cookie set
 */
export function setLastVisitedStore(response: NextResponse, storeId: string): NextResponse {
  response.cookies.set(LAST_STORE_COOKIE_CONFIG.name, storeId, {
    maxAge: LAST_STORE_COOKIE_CONFIG.maxAge,
    httpOnly: LAST_STORE_COOKIE_CONFIG.httpOnly,
    secure: LAST_STORE_COOKIE_CONFIG.secure,
    sameSite: LAST_STORE_COOKIE_CONFIG.sameSite,
    path: LAST_STORE_COOKIE_CONFIG.path,
  });

  return response;
}

/**
 * Gets the last visited store ID from cookies
 *
 * @param request - NextRequest object containing cookies
 * @returns The store ID if found, null otherwise
 */
export function getLastVisitedStore(request: NextRequest): string | null {
  return request.cookies.get(LAST_STORE_COOKIE_CONFIG.name)?.value || null;
}

/**
 * Gets the last visited store ID from server-side cookies
 * Note: This function requires dynamic import of cookies() to avoid client-side issues
 *
 * @returns Promise that resolves to the store ID if found, null otherwise
 */
export async function getLastVisitedStoreFromServer(): Promise<string | null> {
  // Dynamic import to avoid client-side bundling issues
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get(LAST_STORE_COOKIE_CONFIG.name)?.value || null;
}

/**
 * Clears the last visited store cookie
 *
 * @param response - NextResponse object to clear the cookie on
 * @returns The response with the cookie cleared
 */
export function clearLastVisitedStore(response: NextResponse): NextResponse {
  response.cookies.delete(LAST_STORE_COOKIE_CONFIG.name);
  return response;
}

/**
 * Client-side function to set the last visited store using document.cookie
 * This is used when we need to set cookies from client components
 *
 * @param storeId - The store ID to save as the last visited store
 */
export function setLastVisitedStoreClient(storeId: string): void {
  const cookieValue = `${LAST_STORE_COOKIE_CONFIG.name}=${storeId}; max-age=${LAST_STORE_COOKIE_CONFIG.maxAge}; path=${LAST_STORE_COOKIE_CONFIG.path}; SameSite=${LAST_STORE_COOKIE_CONFIG.sameSite}${LAST_STORE_COOKIE_CONFIG.secure ? '; Secure' : ''}`;
  document.cookie = cookieValue;
}

/**
 * Client-side function to get the last visited store from document.cookie
 *
 * @returns The store ID if found, null otherwise
 */
export function getLastVisitedStoreClient(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const lastStoreCookie = cookies.find((cookie) => cookie.trim().startsWith(`${LAST_STORE_COOKIE_CONFIG.name}=`));

  return lastStoreCookie ? lastStoreCookie.split('=')[1] : null;
}

/**
 * Client-side function to clear the last visited store cookie
 */
export function clearLastVisitedStoreClient(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${LAST_STORE_COOKIE_CONFIG.name}=; max-age=0; path=${LAST_STORE_COOKIE_CONFIG.path}`;
}
