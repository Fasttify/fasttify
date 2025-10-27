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

export const MINIFICATION_PATTERNS = {
  htmlComment: /<!--[\s\S]*?-->/g,
  blockComment: /\/\*[\s\S]*?\*\//g,
  lineComment: /\/\/.*$/gm,
  trimLines: /^[ \t]+|[ \t]+$/gm,
  multipleNewlines: /\n\s*\n\s*\n/g,
  multipleSpaces: /\s+/g,
  operatorSpaces: /\s*([=+\-*/%&|^!~?:,;{}()\[\]<>])\s*/g,
  liquidComment: /\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}/g,
  styleBlock: /<style[^>]*>([\s\S]*?)<\/style\b[^>]*>/gi,
  scriptBlock: /<script[^>]*>([\s\S]*?)<\/script\b[^>]*>/gi,
} as const;

export const CSS_MINIFICATION_PATTERNS = {
  comments: /\/\*[\s\S]*?\*\//g,
  spaces: /\s+/g,
  syntax: /\s*([{}|:;,])\s*/g,
} as const;

export const CSS_OPTIMIZATION_PATTERNS = {
  comments: /\/\*[\s\S]*?\*\//g,
  braces: /\s*{\s*|\s*}\s*/g,
  semicolons: /\s*;\s*/g,
  emptyLines: /^\s*[\r\n]/gm,
} as const;
