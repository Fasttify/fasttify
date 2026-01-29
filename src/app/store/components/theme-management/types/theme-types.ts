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
  onFileSelect?: (file: File | null) => void;
}

export interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  fileCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
}

export interface ThemeAction {
  content: string;
  icon?: React.ComponentType<any>;
  onAction: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ThemePreviewCardProps {
  theme: Theme;
  onCustomize: () => void;
  onAction: (action: string, theme: Theme) => void;
}

export interface ImportThemeDropdownProps {
  onUploadTheme: () => void;
}

export interface InactiveThemesListProps {
  themes: Theme[];
  onAction: (action: string, theme: Theme) => void;
}
