import { NextRequest, NextResponse } from 'next/server'
import { templateDevSynchronizer } from '@/renderer-engine/services/templates/template-dev-synchronizer'

/**
 * API para manejar la sincronización de plantillas en modo desarrollo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, storeId, localDir, bucketName, region } = body

    switch (action) {
      case 'start':
        if (!storeId || !localDir) {
          return NextResponse.json({ error: 'storeId and localDir are required' }, { status: 400 })
        }

        await templateDevSynchronizer.start({
          storeId,
          localDir,
          bucketName,
          region,
        })

        return NextResponse.json({
          status: 'started',
          message: `Monitoring ${localDir} and syncing to store ${storeId}`,
        })

      case 'stop':
        await templateDevSynchronizer.stop()
        return NextResponse.json({
          status: 'stopped',
          message: 'Template synchronization stopped',
        })

      case 'sync':
        if (!templateDevSynchronizer.isRunning()) {
          return NextResponse.json({ error: 'Synchronizer is not running' }, { status: 400 })
        }
        await templateDevSynchronizer.syncAll()
        return NextResponse.json({
          status: 'synced',
          message: 'All templates synchronized',
        })

      case 'status':
        return NextResponse.json({
          isRunning: templateDevSynchronizer.isRunning(),
          changes: templateDevSynchronizer.getRecentChanges(),
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in template sync endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!templateDevSynchronizer.isRunning()) {
      return NextResponse.json({ status: 'inactive' })
    }

    return NextResponse.json({
      status: 'active',
      changes: templateDevSynchronizer.getRecentChanges(),
    })
  } catch (error) {
    console.error('Error in template sync status endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
