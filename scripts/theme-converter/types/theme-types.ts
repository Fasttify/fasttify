/**
 * Tipos para estructuras de temas Shopify y Fasttify
 */

export interface ThemeFile {
  path: string;
  relativePath: string;
  content: string;
  type: FileType;
  encoding?: BufferEncoding;
}

export enum FileType {
  LIQUID = 'liquid',
  JSON = 'json',
  CSS = 'css',
  JAVASCRIPT = 'javascript',
  IMAGE = 'image',
  FONT = 'font',
  OTHER = 'other',
}

export interface ThemeStructure {
  layout: ThemeFile[];
  templates: ThemeFile[];
  sections: ThemeFile[];
  snippets: ThemeFile[];
  assets: ThemeFile[];
  config: ThemeFile[];
  locales: ThemeFile[];
}

export interface ShopifyTheme {
  path: string;
  structure: ThemeStructure;
  metadata?: ThemeMetadata;
}

export interface FasttifyTheme {
  path: string;
  structure: ThemeStructure;
  metadata?: ThemeMetadata;
}

export interface ThemeMetadata {
  name?: string;
  version?: string;
  author?: string;
  description?: string;
  themeVersion?: string;
}

export interface FileMap {
  [fileName: string]: {
    path: string;
    relativePath: string;
    type: FileType;
  };
}
