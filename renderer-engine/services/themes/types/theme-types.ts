export interface ThemeFile {
  path: string;
  content: string | Buffer;
  type: ThemeFileType;
  size: number;
  lastModified: Date;
}

export type ThemeFileType = 'liquid' | 'json' | 'css' | 'js' | 'image' | 'font' | 'other';

export interface ThemeAsset {
  path: string;
  type: 'image' | 'font' | 'css' | 'js';
  size: number;
  optimized: boolean;
  originalSize: number;
}

export interface ThemeSection {
  name: string;
  content: string;
  settings: Record<string, any>;
  blocks: any[];
}

export interface ThemeTemplate {
  name: string;
  content: string;
  type: 'index' | 'product' | 'collection' | 'page' | 'cart' | '404';
  settings: Record<string, any>;
}

export interface ThemeSettings {
  name: string;
  version: string;
  author?: string;
  description?: string;
  homepage?: string;
  support?: string;
  license?: string;
  settings_schema: any[];
  settings_defaults: Record<string, any>;
  previewUrl?: string;
}

export interface ProcessedTheme {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  files: ThemeFile[];
  assets: ThemeAsset[];
  sections: ThemeSection[];
  templates: ThemeTemplate[];
  settings: ThemeSettings;
  analysis: any;
  validation: any;
  preview?: string;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeProcessingOptions {
  validateSyntax: boolean;
  optimizeAssets: boolean;
  generatePreview: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  maxFiles: number;
}

export interface ThemeStorageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface Theme {
  id: string;
  name: string;
  version: string;
  storeId: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}
