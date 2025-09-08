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
import type { TemplateObject, CopyResult, TemplateMetadata } from '../types';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET || 'us-east-2',
    });
    this.bucketName = process.env.BUCKET_NAME || '';
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
   * Copia múltiples objetos de plantilla al almacenamiento del usuario
   */
  async copyTemplateToUserStore(
    templateObjects: TemplateObject[],
    storeId: string,
    metadata: TemplateMetadata
  ): Promise<CopyResult[]> {
    const copyPromises = templateObjects.map(async ({ key, relativePath }) => {
      const targetKey = `templates/${storeId}/${relativePath}`;
      await this.copyObject(key, targetKey, metadata);

      return {
        key: targetKey,
        path: relativePath,
      };
    });

    return Promise.all(copyPromises);
  }
}
