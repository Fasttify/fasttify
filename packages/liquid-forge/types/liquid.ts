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

import { FS, Liquid } from 'liquidjs';

export interface LiquidEngineConfig {
  cache: boolean;
  greedy: boolean;
  trimTagLeft: boolean;
  trimTagRight: boolean;
  trimOutputLeft: boolean;
  trimOutputRight: boolean;
  strictFilters: boolean;
  strictVariables: boolean;
  globals: Record<string, any>;
  fs?: FS;
  root?: string | string[];
  context?: Record<string, any>;
}

export interface LiquidFilter {
  name: string;
  filter: (this: { context: any }, ...args: any[]) => any;
}

export interface LiquidTag {
  name: string;
  parse: (token: any, remainTokens: any) => void;
  render: (ctx: any, emitter: any) => any;
}

export interface LiquidContext {
  [key: string]: any;
}

export interface CompiledTemplate {
  liquid: Liquid;
  template: any;
  cacheKey: string;
  compiledAt: Date;
}

export interface MoneyFilter {
  (amount: number | string, format?: string): string;
}

export interface ImageFilter {
  (url: string, size?: string): string;
}

export interface UrlFilter {
  (path: string, params?: Record<string, string>): string;
}

export interface DateFilter {
  (date: string | Date, format?: string): string;
}

export interface ProductFormTag {
  productId: string;
  action?: string;
  class?: string;
}

export interface PaginateTag {
  collection: any[];
  pageSize: number;
  baseUrl: string;
}

export interface CommentTag {
  content: string;
}

export interface ScriptTag {
  content: string;
  attributes?: Record<string, string>;
}

export interface SectionTag {
  name: string;
  content: string;
  id?: string;
}

export interface SectionsTag {
  name: string;
  content: string;
  id?: string;
}

export interface PaginateTag {
  array: unknown[];
  limit: number;
  windowSize?: number;
  currentPage: number;
  totalPages: number;
}

export interface RenderTag {
  snippetName: string;
  parameters?: Record<string, unknown>;
}

export interface StyleTag {
  cssContent: string;
}

export interface JavaScriptTag {
  jsContent: string;
  sectionId?: string;
}
