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
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { TemplateObject, CopyResult, TemplateMetadata } from '@/api/stores/template/types';
import { PostCSSProcessor } from '@/liquid-forge';
import { getContentType } from '@/lib/utils';

export class S3TemplateController {
  private s3Client: S3Client;
  private bucketName: string;
  private postcssProcessor: PostCSSProcessor;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET,
    });
    this.bucketName = process.env.BUCKET_NAME || '';
    this.postcssProcessor = PostCSSProcessor.getInstance();
  }

  /**
   * Lista todos los objetos de la plantilla base desde S3
   */
  async listBaseTemplateObjects(baseTemplatePrefix: string): Promise<TemplateObject[]> {
    const objects: TemplateObject[] = [];
    let continuationToken: string | undefined = undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: baseTemplatePrefix,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput = await this.s3Client.send(command);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== baseTemplatePrefix) {
            // Excluir el prefijo mismo
            const relativePath = object.Key.replace(baseTemplatePrefix, '');
            objects.push({
              key: object.Key,
              relativePath,
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  /**
   * Copia un objeto de S3 a otra ubicación
   */
  async copyObject(sourceKey: string, targetKey: string, metadata: TemplateMetadata): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: targetKey,
      Metadata: metadata as Record<string, string>,
      MetadataDirective: 'REPLACE',
    });

    await this.s3Client.send(command);
  }

  /**
   * Obtiene el contenido de un objeto de S3
   */
  async getObjectContent(key: string): Promise<Uint8Array | null> {
    try {
      const response = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: key }));
      const body = await response.Body?.transformToByteArray();
      return body || null;
    } catch (error) {
      console.error('Failed to get object content from S3', key, error);
      return null;
    }
  }

  /**
   * Sube contenido procesado a S3
   */
  async putProcessedObject(key: string, content: string, metadata: TemplateMetadata): Promise<void> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: content,
        ContentType: getContentType(key),
        Metadata: metadata as Record<string, string>,
      },
    });

    await upload.done();
  }

  /**
   * Copia múltiples objetos de plantilla al almacenamiento del usuario
   * Procesa archivos CSS, JS y Liquid con PostCSS antes de copiarlos
   */
  async copyTemplateToUserStore(
    templateObjects: TemplateObject[],
    storeId: string,
    metadata: TemplateMetadata
  ): Promise<CopyResult[]> {
    const copyPromises = templateObjects.map(async ({ key, relativePath }) => {
      const targetKey = `templates/${storeId}/${relativePath}`;

      // Si es un archivo procesable, procesarlo antes de copiar
      if (this.isProcessableAsset(relativePath)) {
        try {
          const body = await this.getObjectContent(key);
          if (body) {
            const content = new TextDecoder('utf-8').decode(body);

            const result = await this.postcssProcessor.processAsset(content, relativePath);

            // Subir el contenido procesado
            await this.putProcessedObject(targetKey, result.content, metadata);
          } else {
            await this.copyObject(key, targetKey, metadata);
          }
        } catch (_error) {
          // Fallback a copia normal si falla el procesamiento
          await this.copyObject(key, targetKey, metadata);
        }
      } else {
        // Copia normal para archivos no procesables
        await this.copyObject(key, targetKey, metadata);
      }

      return {
        key: targetKey,
        path: relativePath,
      };
    });

    return Promise.all(copyPromises);
  }

  /**
   * Verifica si un archivo debe ser procesado por PostCSS
   */
  private isProcessableAsset(path: string): boolean {
    // Para CSS y JS: solo en carpeta assets/
    const isAssetCSSJS =
      (path.includes('/assets/') || path.startsWith('assets/')) &&
      (path.endsWith('.css') || path.endsWith('.css.liquid') || path.endsWith('.js') || path.endsWith('.js.liquid'));

    // Para Liquid: en cualquier parte del tema
    const isLiquidFile = path.endsWith('.liquid');

    const isProcessable = isAssetCSSJS || isLiquidFile;

    return isProcessable;
  }
}
