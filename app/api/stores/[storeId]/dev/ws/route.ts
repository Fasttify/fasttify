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

import { NextRequest } from 'next/server';
import { withAuthHandler } from '@/api/_lib/auth-middleware';
import { handleSSEConnection } from '@/app/api/stores/_lib/dev-server/controllers/sse-controller';

/**
 * Endpoint SSE (Server-Sent Events) para hot-reload del editor
 * Similar a template-dev pero específico para el Theme Studio
 */
export const GET = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    const url = new URL(request.url);
    if (!url.searchParams.has('storeId')) {
      url.searchParams.set('storeId', storeId);
    }

    const modifiedRequest = new NextRequest(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: request.signal,
    });

    return handleSSEConnection(modifiedRequest);
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);
