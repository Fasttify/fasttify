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

export const SECURITY_PATTERNS = {
  externalScript: /<script[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
  externalCss: /<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
  externalImage: /src=["'](https?:\/\/[^"']+)["']/gi,
  externalUrl: /https?:\/\/[^\s"']+/gi,
} as const;

export const DANGEROUS_FUNCTION_PATTERNS = {
  eval: /eval\s*\(/,
  functionConstructor: /Function\s*\(/,
  setTimeout: /setTimeout\s*\(/,
  setInterval: /setInterval\s*\(/,
  documentWrite: /document\.write/,
  documentWriteln: /document\.writeln/,
  innerHTML: /innerHTML\s*=/,
  outerHTML: /outerHTML\s*=/,
} as const;

export const SENSITIVE_DATA_PATTERNS = {
  apiKey: /api_key/,
  secret: /secret/,
  password: /password/,
  token: /token/,
  privateKey: /private_key/,
  accessKey: /access_key/,
} as const;

export const IMAGE_PATTERNS = {
  imgTag: /<img[^>]*src=["']([^"']+)["'][^>]*>/gi,
  imgSrc: /src=["']([^"']+)["']/,
} as const;

export const SPACE_PATTERNS = {
  multipleSpaces: /\s{2,}/g,
} as const;
