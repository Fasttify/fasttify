import { useCallback } from 'react';
import { ThemeFile } from '../../types/editor-types';

interface UseFileContentProps {
  files: ThemeFile[];
  onFileChange?: (filePath: string, content: string) => void;
  onMarkAsModified: () => void;
}

export const useFileContent = ({ files, onFileChange, onMarkAsModified }: UseFileContentProps) => {
  // Actualizar contenido de archivo (solo local)
  const updateFileContent = useCallback(
    (fileId: string, content: string) => {
      onMarkAsModified();

      // Notificar cambio al componente padre
      const file = files.find((f) => f.id === fileId);
      if (file) {
        onFileChange?.(file.path, content);
      }
    },
    [files, onFileChange, onMarkAsModified]
  );

  return {
    updateFileContent,
  };
};
