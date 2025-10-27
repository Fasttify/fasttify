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

export const ESCAPE_PATTERNS = {
  ampersand: /&/g,
  lessThan: /</g,
  greaterThan: />/g,
  doubleQuote: /"/g,
  apostrophe: /'/g,
} as const;

export const HANDLE_PATTERNS = {
  aVariants: /[áàäâã]/g,
  eVariants: /[éèëê]/g,
  iVariants: /[íìïî]/g,
  oVariants: /[óòöôõ]/g,
  uVariants: /[úùüû]/g,
  enye: /[ñ]/g,
  cCedilla: /[ç]/g,
  nonAlphanumeric: /[^a-z0-9]/g,
  multipleDashes: /-+/g,
  leadingTrailingDash: /^-|-$/g,
} as const;

export const URL_PATTERNS = {
  trailingSlashes: /\/+$/,
} as const;
