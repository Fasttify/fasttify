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

/**
 * Patrones para detección de sintaxis Liquid
 */
export const LIQUID_OBJECT_PATTERNS = {
  products: /\{\{\s*products\s*[\|\}]/g,
  collections: /\{\{\s*collections\s*[\|\}]/g,
  product: /\{\{\s*product\./g,
  collection: /\{\{\s*collection\./g,
  linklists: /\{\{\s*linklists\./g,
  shop: /\{\{\s*shop\./g,
  pages: /\{\{\s*pages\s*[\|\}]/g,
  page: /\{\{\s*page\./g,
  blog: /\{\{\s*blog\./g,
  checkout: /\{\{\s*checkout\./g,
  relatedProducts: /related_products|product\s*\|\s*related/g,
  pagination: /\{\%\s*paginate/g,
} as const;

export const LIQUID_TAG_PATTERNS = {
  paginate: /\{\%\s*paginate\s+([^%]+)\%\}/g,
  section: /\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g,
  render: /\{\%\s*render\s+['"]([^'"]+)['"]/g,
  include: /\{\%\s*include\s+['"]([^'"]+)['"]/g,
} as const;

export const LIQUID_COLLECTION_ACCESS_PATTERNS = {
  bracketNotation: /collections\[['"]([^'"]+)['"]\]/g,
  dotNotation: /collections\.([a-zA-Z0-9_-]+)(?!\.\w)/g,
  specificAccess: /collections\[['"]([^'"]+)['"]\]|collections\.([a-zA-Z0-9_-]+)(?!\.\w)/g,
  collectionProducts: /collections\.([a-zA-Z0-9_-]+)\.products/g,
  specificPage: /pages\[['"]([^'"]+)['"]\]|pages\.([a-zA-Z0-9_-]+)(?!\.\w)/g,
  specificProduct: /products\[['"]([^'"]+)['"]\]/g,
  extractCollectionHandle: /collections\.([a-zA-Z0-9_-]+)/,
  extractPagesBracket: /pages\[['"]([^'"]+)['"]\]/g,
  extractPagesDot: /pages\.([a-zA-Z0-9_-]+)(?!\.\w)/g,
  extractPagesHandle: /pages\.([a-zA-Z0-9_-]+)/,
  pagesBracketExtract: /pages\[['"]([^'"]+)['"]\]/,
} as const;

export const LIQUID_FILTER_PATTERNS = {
  productRelated: /related_products[^}]*limit:\s*(\d+)/i,
  productsLimit: /products[^}]*limit:\s*(\d+)/i,
  collectionsLimit: /collections[^}]*limit:\s*(\d+)/i,
  generalLimit: /limit:\s*(\d+)/i,
  paginateBy: /\s+by\s+/,
} as const;

export const LIQUID_OPTION_EXTRACTOR_PATTERNS = {
  sectionName: /section\s+['"]([^'"]+)['"]/i,
  snippetName: /(?:render|include)\s+['"]([^'"]+)['"]/i,
  collectionHandle: /collections\[['"]([^'"]+)['"]\]/,
} as const;

export const LIQUID_PAGINATION_PATTERNS = {
  paginate: /\{%\s*paginate\s+(.+?)\s*%\}/,
  policies: /for\s+item\s+in\s+policies|for\s+policy\s+in\s+policies|\{\{\s*policies\s*[\|\}]/g,
  pagesLimit: /pages[^}]*limit:\s*(\d+)/i,
} as const;

export const LIQUID_VARIABLE_PATTERNS = {
  variable: /\{\{\s*([^}]+)\s*\}\}/g,
  cleanVariableTags: /\{\{\s*|\s*\}\}/g,
} as const;
