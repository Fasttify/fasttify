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
import { logger } from '@/liquid-forge/lib/logger';
import { S3StorageService } from '@/liquid-forge/services/themes/storage/s3-storage-service';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { getCdnUrlForKey } from '@/utils/server';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { generateProcessId } from '@/lib/utils/id-utils';

type ProcessStatus = {
  status: 'processing' | 'completed' | 'error';
  message?: string;
  themeId?: string;
  updatedAt: number;
};
const themeProcessStatus: Map<string, ProcessStatus> = new Map();

export async function postConfirmTheme(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const session = await AuthGetCurrentUserServer();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    if (!storeId) return NextResponse.json({ error: 'Store ID is required' }, { status: 400, headers: corsHeaders });

    const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
    if (!userStore) return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    if (userStore.userId !== session.username)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });

    const formData = await request.formData();
    const themeFile = formData.get('theme') as File;
    const themeDataString = formData.get('themeData') as string;
    if (!themeFile || !themeDataString)
      return NextResponse.json(
        { error: 'Theme file and theme data are required' },
        { status: 400, headers: corsHeaders }
      );

    const themeData = JSON.parse(themeDataString);
    const processId = generateProcessId('theme-confirm', storeId);

    let themeId: string | undefined;
    const cdnUrl = getCdnUrlForKey(`templates/${storeId}/theme.zip`);
    try {
      const { data: placeholder } = await cookiesClient.models.UserTheme.create({
        storeId,
        name: themeData?.theme?.name || 'Untitled Theme',
        version: themeData?.theme?.version || '1.0.0',
        author: themeData?.theme?.author || 'Unknown',
        description: themeData?.theme?.description || '',
        s3Key: '',
        cdnUrl: cdnUrl,
        fileCount: themeData?.theme?.fileCount || 0,
        totalSize: themeData?.theme?.totalSize || 0,
        isActive: false,
        settings: JSON.stringify(themeData?.theme?.settings || {}),
        validation: JSON.stringify(themeData?.validation || {}),
        analysis: JSON.stringify(themeData?.analysis || {}),
        preview: themeData?.theme?.preview || null,
        owner: session.username,
      } as any);
      themeId = placeholder?.id;
    } catch (e) {
      logger.warn('Failed to create placeholder theme', e, 'ThemeConfirmAPI');
    }

    themeProcessStatus.set(processId, { status: 'processing', updatedAt: Date.now(), themeId });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Theme confirmation started',
        processId,
        themeId,
        status: 'processing',
        estimatedTime: '30-60 seconds',
      },
      { status: 202, headers: corsHeaders }
    );

    processThemeInBackground(processId, storeId, themeData, themeFile, session.username, themeId);
    return response;
  } catch (error) {
    logger.error('Theme confirmation failed', error, 'ThemeConfirmAPI');
    return NextResponse.json(
      { error: 'Theme confirmation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function getConfirmStatus(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const processId = request.nextUrl.searchParams.get('processId');
    const themeId = request.nextUrl.searchParams.get('themeId');
    if (!processId) return NextResponse.json({ error: 'processId is required' }, { status: 400, headers: corsHeaders });

    if (themeId) {
      try {
        const { data: theme } = await cookiesClient.models.UserTheme.get({ id: themeId });
        if (theme && theme.cdnUrl && theme.s3Key) {
          return NextResponse.json(
            { status: 'completed', themeId, updatedAt: Date.now() },
            { status: 200, headers: corsHeaders }
          );
        }
      } catch (_) {}
    }

    try {
      const s3 = new S3Client({ region: process.env.REGION_BUCKET || 'us-east-2' });
      const baseKey = `templates/${storeId}`;
      const metadataKey = `${baseKey}/metadata.json`;
      const metaResp = await s3.send(new GetObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: metadataKey }));
      if (metaResp.Body) {
        const text = await metaResp.Body.transformToString();
        const meta = JSON.parse(text || '{}');
        if (meta.status === 'ready') {
          return NextResponse.json(
            { status: 'completed', themeId: meta.themeId, updatedAt: Date.now() },
            { status: 200, headers: corsHeaders }
          );
        }
        try {
          await s3.send(new HeadObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: `${baseKey}/theme.zip` }));
          return NextResponse.json(
            { status: 'completed', themeId: meta.themeId, updatedAt: Date.now() },
            { status: 200, headers: corsHeaders }
          );
        } catch (_) {}
      }
    } catch (_) {}

    const status = themeProcessStatus.get(processId);
    if (!status) return NextResponse.json({ status: 'unknown' }, { status: 200, headers: corsHeaders });
    return NextResponse.json(status, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Status check failed', error, 'ThemeConfirmAPI');
    return NextResponse.json(
      { error: 'Status check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function processThemeInBackground(
  processId: string,
  storeId: string,
  themeData: any,
  themeFile: File,
  username: string,
  themeId?: string
) {
  try {
    const processedTheme = {
      id: themeData.theme.id,
      name: themeData.theme.name,
      version: themeData.theme.version,
      author: themeData.theme.author,
      description: themeData.theme.description,
      files: themeData.theme.files || [],
      sections: themeData.theme.sections || [],
      templates: themeData.theme.templates || [],
      assets: themeData.theme.assets || [],
      totalSize: themeData.theme.totalSize || 0,
      settings: themeData.theme.settings || {
        name: themeData.theme.name,
        version: themeData.theme.version,
        settings_schema: [],
        settings_defaults: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      validation: themeData.validation,
      analysis: themeData.analysis,
      preview: themeData.theme.preview,
    };

    const s3Storage = S3StorageService.getInstance();
    const storageResult = await s3Storage.storeTheme(processedTheme as any, storeId, themeFile);

    if (!storageResult.success) {
      logger.error('S3 storage failed', { processId, error: storageResult.error }, 'ThemeConfirmAPI');
      themeProcessStatus.set(processId, {
        status: 'error',
        message: storageResult.error || 'S3 storage failed',
        updatedAt: Date.now(),
      });
      return;
    }

    const themeRecord = {
      storeId,
      name: processedTheme.name,
      version: processedTheme.version,
      author: processedTheme.author || 'Unknown',
      description: processedTheme.description || '',
      s3Key: storageResult.s3Key,
      cdnUrl: storageResult.cdnUrl,
      fileCount: themeData.theme.fileCount || 0,
      totalSize: processedTheme.totalSize,
      isActive: false,
      settings: JSON.stringify(processedTheme.settings),
      validation: JSON.stringify(themeData.validation),
      analysis: JSON.stringify(themeData.analysis),
      preview: storageResult.previewCdnUrl || themeData.theme.preview,
      owner: username,
    };

    let savedThemeId: string | undefined = themeId;
    if (themeId) {
      const { owner: _omitOwner, ...updatePayload } = themeRecord as any;
      const { data: updated, errors: updateErrors } = await cookiesClient.models.UserTheme.update({
        id: themeId,
        ...updatePayload,
      } as any);
      if (updateErrors) {
        logger.error('Failed to update placeholder theme', { processId, errors: updateErrors }, 'ThemeConfirmAPI');
        themeProcessStatus.set(processId, {
          status: 'error',
          message: 'Failed to update theme',
          updatedAt: Date.now(),
        });
        return;
      }
      savedThemeId = updated?.id;
    } else {
      const { data: created, errors: createErrors } = await cookiesClient.models.UserTheme.create(themeRecord);
      if (createErrors) {
        logger.error('Failed to save theme to database', { processId, errors: createErrors }, 'ThemeConfirmAPI');
        themeProcessStatus.set(processId, {
          status: 'error',
          message: 'Failed to save theme to database',
          updatedAt: Date.now(),
        });
        return;
      }
      savedThemeId = created?.id;
    }

    themeProcessStatus.set(processId, { status: 'completed', themeId: savedThemeId, updatedAt: Date.now() });
  } catch (error) {
    logger.error('Background theme processing failed', { processId, error }, 'ThemeConfirmAPI');
    themeProcessStatus.set(processId, {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: Date.now(),
    });
  }
}
