export interface ThemeUploadResult {
  success: boolean;
  theme: {
    id: string;
    name: string;
    version: string;
    author?: string;
    description?: string;
    fileCount: number;
    assetCount: number;
    sectionCount: number;
    templateCount: number;
    preview?: string;
  };
  validation: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    errors: any[];
    warnings: any[];
  };
  analysis?: any;
  storage?: {
    success: boolean;
    storeId: string;
    s3Key: string;
    cdnUrl?: string;
    error?: string;
  } | null;
}

export interface ThemeUploadFormProps {
  storeId: string;
  onUpload: (file: File) => Promise<ThemeUploadResult>;
  onConfirm: (result: ThemeUploadResult, originalFile: File) => Promise<{ ok: boolean; processId?: string }>;
  onCancel: () => void;
}
