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

export interface TemplateRequest {
  storeId: string;
  storeName: string;
  domain: string;
  storeData?: {
    theme?: string;
    currency?: string;
    description?: string;
    logo?: string;
    banner?: string;
  };
}

export interface TemplateObject {
  key: string;
  relativePath: string;
}

export interface CopyResult {
  key: string;
  path: string;
}

export interface StoreConfig {
  storeName: string;
  domain: string;
  storeData: {
    theme?: string;
    currency?: string;
    description?: string;
    logo?: string;
    banner?: string;
  };
}

export interface TemplateMetadata {
  [key: string]: string;
  'store-id': string;
  'store-name': string;
  'store-domain': string;
  'store-description': string;
  'store-currency': string;
  'store-theme': string;
  'template-type': string;
  'upload-time': string;
}

export interface TemplateResponse {
  success: boolean;
  message: string;
  templateUrls: Record<string, string>;
  copiedFiles: number;
  files: CopyResult[];
  validation: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    errors: any[];
    warnings: any[];
    theme: any;
  };
}
