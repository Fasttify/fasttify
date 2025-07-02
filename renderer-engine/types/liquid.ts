import { Liquid, FS } from 'liquidjs';

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
  filter: (...args: any[]) => any;
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
  template: any; // Plantilla compilada interna de LiquidJS
  cacheKey: string;
  compiledAt: Date;
}

// Filtros específicos para e-commerce
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

// Tags personalizados para e-commerce
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
