import { useCallback } from 'react';
import { ThemeFile } from '../../types/editor-types';

export const useFileActions = () => {
  // Copiar archivo al portapapeles
  const copyFile = useCallback((file: ThemeFile) => {
    navigator.clipboard.writeText(file.content || '');
    // TODO: Mostrar notificación de éxito
  }, []);

  // Descargar archivo
  const downloadFile = useCallback((file: ThemeFile) => {
    const blob = new Blob([file.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    copyFile,
    downloadFile,
  };
};
