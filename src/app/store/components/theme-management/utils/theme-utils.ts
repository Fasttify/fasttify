export function getValidationTone(isValid: boolean): 'success' | 'warning' | 'critical' {
  return isValid ? 'success' : 'warning';
}

export function getStorageTone(success: boolean): 'success' | 'critical' {
  return success ? 'success' : 'critical';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
