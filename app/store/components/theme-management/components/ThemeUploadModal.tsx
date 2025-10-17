'use client';

import { Modal } from '@shopify/polaris';
import { useState } from 'react';
import { ThemeUploadForm } from '@/app/store/components/theme-management/components/ThemeUploadForm';
import type { ThemeUploadResult } from '@/app/store/components/theme-management/types/theme-types';

interface ThemeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  onUpload: (file: File) => Promise<ThemeUploadResult>;
  onConfirm: (result: ThemeUploadResult, originalFile: File) => Promise<{ ok: boolean; processId?: string }>;
  onCancel: () => void;
}

export function ThemeUploadModal({
  isOpen,
  onClose,
  storeId,
  onUpload,
  onConfirm,
  onCancel: _onCancel,
}: ThemeUploadModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCompleteUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // 1. Upload del archivo
      const uploadResult = await onUpload(selectedFile);

      // 2. Si es válido, confirmar automáticamente
      if (uploadResult.validation?.isValid) {
        const confirmResult = await onConfirm(uploadResult, selectedFile);
        if (confirmResult.ok) {
          setTimeout(() => onClose(), 2000);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Subir tema"
      size="fullScreen"
      primaryAction={{
        content: 'Subir archivo',
        onAction: handleCompleteUpload,
        disabled: isProcessing || !selectedFile,
        loading: isProcessing,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onClose,
          disabled: isProcessing,
        },
      ]}>
      <Modal.Section>
        <ThemeUploadForm
          storeId={storeId}
          onUpload={onUpload}
          onConfirm={onConfirm}
          onCancel={onClose}
          onFileSelect={setSelectedFile}
        />
      </Modal.Section>
    </Modal>
  );
}
