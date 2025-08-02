export interface ValidationError {
  type: 'structure' | 'syntax' | 'configuration' | 'security' | 'performance';
  message: string;
  file?: string;
  severity: 'error' | 'critical' | 'warning';
}

export interface ValidationWarning {
  type: 'best_practice' | 'security' | 'performance';
  message: string;
  file?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  analysis?: any;
}

export interface ThemeValidationConfig {
  maxFileSize: number;
  maxFiles: number;
  allowedFileTypes: string[];
  requiredFiles: string[];
  forbiddenPatterns: RegExp[];
  maxAssetSize: number;
}

export interface ValidationRule {
  name: string;
  description: string;
  validate: (files: any[], config: ThemeValidationConfig) => ValidationResult;
}

export interface ValidationRuleConfig {
  enabled: boolean;
  severity: 'error' | 'warning' | 'info';
  customMessage?: string;
}
