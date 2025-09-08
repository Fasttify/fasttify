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
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import {
  startSync,
  stopSync,
  syncAll,
  getStatus,
} from '@/api/stores/_lib/template-dev/controllers/template-sync-controller';

/**
 * API para manejar la sincronización de plantillas en modo desarrollo
 */
export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start':
        return startSync(request, body);
      case 'stop':
        return stopSync(request);
      case 'sync':
        return syncAll(request);
      case 'status':
        return getStatus(request);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  return getStatus(request);
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}
