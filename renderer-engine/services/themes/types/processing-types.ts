export interface ExtractionResult {
  files: any[];
  totalSize: number;
  fileCount: number;
}

export interface ProcessingStep {
  name: string;
  description: string;
  execute: (input: any, options?: any) => Promise<any>;
}

export interface ProcessingPipeline {
  steps: ProcessingStep[];
  execute: (input: any, options?: any) => Promise<any>;
}

export interface FileProcessingOptions {
  validateSyntax: boolean;
  optimizeContent: boolean;
  extractMetadata: boolean;
}

export interface AssetProcessingOptions {
  compressImages: boolean;
  minifyCss: boolean;
  minifyJs: boolean;
  generateWebp: boolean;
}

export interface TemplateProcessingOptions {
  validateSchema: boolean;
  extractSettings: boolean;
  generatePreview: boolean;
}
