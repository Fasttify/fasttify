'use client';

import { ThemeUploadForm } from '@/app/store/components/theme-management/components/ThemeUploadForm';
import type { ThemeUploadResult } from '@/app/store/components/theme-management/types/theme-types';
import { useToast } from '@/app/store/context/ToastContext';
import useStoreDataStore from '@/context/core/storeDataStore';
import { Button } from '@shopify/polaris';
import { useCallback, useState } from 'react';

export function ThemeUploader() {
  const { currentStore } = useStoreDataStore();
  const { showToast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUpload = useCallback(
    async (file: File): Promise<ThemeUploadResult> => {
      if (!currentStore?.storeId) {
        throw new Error('Store ID not found');
      }

      const formData = new FormData();
      formData.append('theme', file);
      formData.append('name', file.name.replace('.zip', ''));
      formData.append('description', 'Uploaded theme');

      const response = await fetch(`/api/stores/${currentStore.storeId}/themes/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        if (result.details) {
          return result.details;
        } else if (result.success !== undefined) {
          return result;
        } else {
          throw new Error('Unexpected response from server');
        }
      } else {
        throw new Error(result.error || result.message || 'Upload failed');
      }
    },
    [currentStore]
  );

  const handleConfirm = useCallback(
    async (result: ThemeUploadResult, originalFile: File): Promise<{ ok: boolean; processId?: string }> => {
      if (!currentStore?.storeId) {
        showToast('Error: Store ID not found', true);
        return { ok: false };
      }

      try {
        // Crear FormData con el archivo ZIP original y los datos del tema
        const formData = new FormData();
        formData.append('theme', originalFile);
        formData.append('themeData', JSON.stringify(result));

        // Llamar a la API de confirmación para almacenar en S3
        const response = await fetch(`/api/stores/${currentStore.storeId}/themes/confirm`, {
          method: 'POST',
          body: formData,
        });

        const confirmResult = await response.json();

        if (response.ok && confirmResult.success) {
          showToast('Tema subido y activado con éxito');
          return { ok: true, processId: confirmResult.processId };
        } else {
          showToast(confirmResult.error || 'Error al confirmar el tema', true);
          return { ok: false };
        }
      } catch (error) {
        console.error('Confirm error:', error);
        showToast('Error al confirmar el tema', true);
        return { ok: false };
      }
    },
    [currentStore, showToast]
  );

  return (
    <>
      <Button onClick={() => setShowUploadModal(true)}>Subir tema personalizado</Button>

      {showUploadModal && (
        <ThemeUploadForm
          storeId={currentStore?.storeId || ''}
          onUpload={handleUpload}
          onConfirm={handleConfirm}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
}
