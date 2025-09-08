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
import { logger } from '@/renderer-engine/lib/logger';
import { templateDevSynchronizer } from '@/renderer-engine/services/templates/sync/template-dev-synchronizer';

export async function startSync(request: NextRequest, body?: any): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const requestBody = body || (await request.json());
    const { storeId, localDir, bucketName, region } = requestBody;

    if (!storeId || !localDir) {
      return NextResponse.json({ error: 'storeId and localDir are required' }, { status: 400, headers: corsHeaders });
    }

    await templateDevSynchronizer.start({
      storeId,
      localDir,
      bucketName,
      region,
    });

    return NextResponse.json(
      {
        status: 'started',
        message: `Monitoring ${localDir} and syncing to store ${storeId}`,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error starting template sync', error, 'TemplateDev');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function stopSync(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    await templateDevSynchronizer.stop();
    return NextResponse.json(
      {
        status: 'stopped',
        message: 'Template synchronization stopped',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error stopping template sync', error, 'TemplateDev');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function syncAll(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    if (!templateDevSynchronizer.isRunning()) {
      return NextResponse.json({ error: 'Synchronizer is not running' }, { status: 400, headers: corsHeaders });
    }
    await templateDevSynchronizer.syncAll();
    return NextResponse.json(
      {
        status: 'synced',
        message: 'All templates synchronized',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error syncing all templates', error, 'TemplateDev');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function getStatus(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    return NextResponse.json(
      {
        isRunning: templateDevSynchronizer.isRunning(),
        changes: templateDevSynchronizer.getRecentChanges(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error getting template sync status', error, 'TemplateDev');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
