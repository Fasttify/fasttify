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

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  _Object,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { getCdnUrlForKey } from '@/utils/server';
import { buildThemePrefix, isTextFile, createFileId } from './path-utils';

export interface ListedFile {
  id: string;
  path: string;
  size: number;
  lastModified: string;
  content?: string;
  cdnUrl?: string;
}

export class ThemeS3Service {
  private static instance: ThemeS3Service;
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly isProduction: boolean;

  private constructor() {
    this.isProduction = process.env.APP_ENV === 'production';
    this.bucket = process.env.BUCKET_NAME || '';
    this.s3 = new S3Client({
      region: process.env.REGION_BUCKET,
    });
    this.bucket = process.env.BUCKET_NAME || '';
  }

  static getInstance(): ThemeS3Service {
    if (!ThemeS3Service.instance) ThemeS3Service.instance = new ThemeS3Service();
    return ThemeS3Service.instance;
  }

  async listThemeFiles(storeId: string, themeId: string, maxInlineBytes: number = 1_000_000): Promise<ListedFile[]> {
    const prefix = buildThemePrefix(storeId, themeId);
    const files: ListedFile[] = [];

    let continuationToken: string | undefined = undefined;
    do {
      const list: ListObjectsV2CommandOutput = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: continuationToken })
      );

      const contents = list.Contents || [];
      for (const obj of contents) {
        if (!obj.Key || obj.Key.endsWith('/')) continue;

        const path = obj.Key.replace(prefix, '');
        if (!isTextFile(path)) continue; // excluir binarios

        const size = Number(obj.Size || 0);
        const base: ListedFile = {
          id: createFileId(path),
          path,
          size,
          lastModified: (obj.LastModified || new Date()).toISOString(),
        };

        if (size <= maxInlineBytes) {
          try {
            if (this.isProduction) {
              const url = getCdnUrlForKey(obj.Key);
              const resp = await fetch(url, {
                headers: {
                  'User-Agent': 'Fasttify-API/1.0',
                  'X-API-Source': 'fasttify-server',
                },
              });
              if (resp.ok) {
                const body = await resp.text();
                files.push({ ...base, content: body, cdnUrl: url });
              } else {
                files.push({ ...base, cdnUrl: url });
              }
            } else {
              const get = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: obj.Key }));
              const body = await (get.Body as any).transformToString('utf-8');
              files.push({ ...base, content: body });
            }
          } catch {
            files.push(base);
          }
        } else {
          const cdnUrl = this.isProduction ? getCdnUrlForKey(obj.Key) : undefined;
          files.push(cdnUrl ? { ...base, cdnUrl } : base);
        }
      }

      continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (continuationToken);

    return files;
  }
}
