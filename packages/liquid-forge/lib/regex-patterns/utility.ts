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

export const PATH_PATTERNS = {
  backslashes: /\\/g,
  leadingSlash: /^\/+/g,
} as const;

export const SANITIZATION_PATTERNS = {
  themeName: /[^a-z0-9]/g,
} as const;

export const JSON_PARSING_PATTERNS = {
  liquidSchema: /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i,
  trailingComma: /,(\s*[}\]])/g,
  multipleCommas: /,,+/g,
  lineComment: /\/\/.*$/gm,
  blockComment: /\/\*[\s\S]*?\*\//g,
} as const;
