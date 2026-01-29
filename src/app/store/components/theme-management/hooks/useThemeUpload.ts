import { useCallback, useRef, useState } from 'react';
import type { ThemeUploadResult } from '@/app/store/components/theme-management/types/theme-types';

interface UseThemeUploadProps {
  storeId: string;
  onUpload: (file: File) => Promise<ThemeUploadResult>;
  onConfirm: (result: ThemeUploadResult, originalFile: File) => Promise<{ ok: boolean; processId?: string }>;
}

interface UseThemeUploadReturn {
  selectedFile: File | null;
  uploadResult: ThemeUploadResult | null;
  isUploading: boolean;
  isConfirming: boolean;
  isProcessing: boolean;
  processingStatus: 'idle' | 'processing' | 'completed' | 'error';
  processingError: string | null;
  uploadProgress: number;
  error: string | null;
  handleFileSelect: (file: File) => void;
  handleUpload: () => Promise<void>;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
  handleClearFile: () => void;
}

export function useThemeUpload({ storeId, onUpload, onConfirm }: UseThemeUploadProps): UseThemeUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<ThemeUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [_processId, setProcessId] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Por favor selecciona un archivo ZIP');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo debe ser menor a 50MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onUpload(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      if (!result.success) {
        setError('Error al procesar el tema');
        return;
      }

      // Si el tema es válido, automáticamente confirmarlo
      if (result.validation?.isValid) {
        setTimeout(() => handleConfirmRef.current?.(), 500);
      }
    } catch (err) {
      setError('Error al subir el tema. Por favor intenta de nuevo.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onUpload]);

  const handleConfirmRef = useRef<() => void>(undefined);

  const handleConfirm = useCallback(async () => {
    if (!uploadResult || !selectedFile) return;

    setIsConfirming(true);
    setError(null);

    try {
      const { ok, processId } = await onConfirm(uploadResult, selectedFile);
      if (ok && processId) {
        setProcessId(processId);
        setIsProcessing(true);
        setProcessingStatus('processing');

        // Polling del estado del proceso
        const start = Date.now();
        const poll = async () => {
          try {
            const res = await fetch(`/api/stores/${storeId}/themes/confirm?processId=${processId}`);
            if (res.ok) {
              const status = await res.json();
              if (status.status === 'completed') {
                setProcessingStatus('completed');
                setIsProcessing(false);
                // Reset de selección para permitir nueva subida
                setSelectedFile(null);
                setUploadResult(null);
                setUploadProgress(0);
                return; // detener polling
              }
              if (status.status === 'error') {
                setProcessingStatus('error');
                setProcessingError(status.message || 'Error en el procesamiento');
                setIsProcessing(false);
                return;
              }
              if (status.status === 'unknown') {
                // Fallback: verificar en la lista de temas si el tema ya aparece
                try {
                  const themesResp = await fetch(`/api/stores/${storeId}/themes`);
                  if (themesResp.ok) {
                    const data = await themesResp.json();
                    const themes = data.themes || [];
                    const expectedName = uploadResult?.theme?.name;
                    const expectedVersion = uploadResult?.theme?.version;
                    const exists = themes.some(
                      (t: any) => t.name === expectedName && String(t.version) === String(expectedVersion)
                    );
                    if (exists) {
                      setProcessingStatus('completed');
                      setIsProcessing(false);
                      setSelectedFile(null);
                      setUploadResult(null);
                      setUploadProgress(0);
                      return;
                    }
                  }
                } catch (_) {}
              }
            }
          } catch (_err) {}

          if (Date.now() - start < 90_000) {
            setTimeout(poll, 2000);
          } else {
            setProcessingStatus('error');
            setProcessingError('Tiempo de espera agotado al confirmar el tema');
            setIsProcessing(false);
          }
        };

        // iniciar primer intento
        setTimeout(poll, 1500);
      }
    } catch (err) {
      setError('Error al confirmar el tema. Por favor intenta de nuevo.');
      console.error('Confirm error:', err);
    } finally {
      setIsConfirming(false);
    }
  }, [uploadResult, selectedFile, onConfirm, storeId]);

  handleConfirmRef.current = handleConfirm;

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return {
    selectedFile,
    uploadResult,
    isUploading,
    isConfirming,
    isProcessing,
    processingStatus,
    processingError,
    uploadProgress,
    error,
    handleFileSelect,
    handleUpload,
    handleConfirm,
    handleCancel,
    handleClearFile,
  };
}
