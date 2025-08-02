import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { templateDevSynchronizer } from '@/renderer-engine/services/templates/sync/template-dev-synchronizer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API para manejar la sincronización de plantillas en modo desarrollo
 */
export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const body = await request.json();
    const { action, storeId, localDir, bucketName, region } = body;

    switch (action) {
      case 'start':
        if (!storeId || !localDir) {
          return NextResponse.json(
            { error: 'storeId and localDir are required' },
            { status: 400, headers: corsHeaders }
          );
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

      case 'stop':
        await templateDevSynchronizer.stop();
        return NextResponse.json(
          {
            status: 'stopped',
            message: 'Template synchronization stopped',
          },
          { headers: corsHeaders }
        );

      case 'sync':
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

      case 'status':
        return NextResponse.json(
          {
            isRunning: templateDevSynchronizer.isRunning(),
            changes: templateDevSynchronizer.getRecentChanges(),
          },
          { headers: corsHeaders }
        );

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    logger.error('Error in template sync endpoint', error, 'TemplateDev');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    if (!templateDevSynchronizer.isRunning()) {
      return NextResponse.json({ status: 'inactive' }, { headers: corsHeaders });
    }

    return NextResponse.json(
      {
        status: 'active',
        changes: templateDevSynchronizer.getRecentChanges(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error in template sync status endpoint', error, 'TemplateDev');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
