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
import { buildThemePrefix, isTextFile, createFileId } from '../utils/path-utils';

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
  private readonly cache: Map<string, { data: ListedFile[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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

  // Limpiar caché para un store específico
  clearCache(storeId?: string): void {
    if (storeId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${storeId}_`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Obtener estadísticas del caché
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  async listThemeFilesMetadata(storeId: string): Promise<ListedFile[]> {
    const cacheKey = `${storeId}_metadata`;

    // Verificar caché
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const prefix = buildThemePrefix(storeId);
    const files: ListedFile[] = [];

    // Obtener solo la lista de archivos sin contenido
    let continuationToken: string | undefined = undefined;

    do {
      const list: ListObjectsV2CommandOutput = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: continuationToken })
      );

      const contents = list.Contents || [];
      for (const obj of contents) {
        if (!obj.Key || obj.Key.endsWith('/')) continue;
        const path = obj.Key.replace(prefix, '');
        if (!isTextFile(path)) continue;

        const file: ListedFile = {
          id: createFileId(path),
          path,
          size: Number(obj.Size || 0),
          lastModified: (obj.LastModified || new Date()).toISOString(),
        };

        files.push(file);
      }

      continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (continuationToken);

    // Guardar en caché
    this.cache.set(cacheKey, { data: files, timestamp: Date.now() });

    return files;
  }

  async listThemeFiles(storeId: string, maxInlineBytes: number = 1_000_000): Promise<ListedFile[]> {
    const cacheKey = `${storeId}_${maxInlineBytes}`;

    // Verificar caché
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const prefix = buildThemePrefix(storeId);
    const files: ListedFile[] = [];

    // Primero, obtener solo la lista de archivos sin contenido
    let continuationToken: string | undefined = undefined;
    const fileObjects: _Object[] = [];

    do {
      const list: ListObjectsV2CommandOutput = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: continuationToken })
      );

      const contents = list.Contents || [];
      for (const obj of contents) {
        if (!obj.Key || obj.Key.endsWith('/')) continue;
        const path = obj.Key.replace(prefix, '');
        if (!isTextFile(path)) continue;
        fileObjects.push(obj);
      }

      continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (continuationToken);

    // Procesar archivos en paralelo (máximo 10 a la vez)
    const BATCH_SIZE = 10;
    for (let i = 0; i < fileObjects.length; i += BATCH_SIZE) {
      const batch = fileObjects.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((obj) => this.processFile(obj, prefix, maxInlineBytes));
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          files.push(result.value);
        }
      }
    }

    // Guardar en caché
    this.cache.set(cacheKey, { data: files, timestamp: Date.now() });

    return files;
  }

  private async processFile(obj: _Object, prefix: string, maxInlineBytes: number): Promise<ListedFile> {
    if (!obj.Key) {
      throw new Error('Object key is required');
    }

    const path = obj.Key.replace(prefix, '');
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
            return { ...base, content: body, cdnUrl: url };
          } else {
            return { ...base, cdnUrl: url };
          }
        } else {
          const get = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: obj.Key }));
          const body = await (get.Body as any).transformToString('utf-8');
          return { ...base, content: body };
        }
      } catch {
        return base;
      }
    } else {
      const cdnUrl = this.isProduction ? getCdnUrlForKey(obj.Key) : undefined;
      return cdnUrl ? { ...base, cdnUrl } : base;
    }
  }
}
