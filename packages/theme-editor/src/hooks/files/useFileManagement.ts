import { useState, useCallback } from 'react';
import { ThemeFile } from '../../types/editor-types';

export const useFileManagement = (files: ThemeFile[]) => {
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Abrir archivo
  const openFile = useCallback((file: ThemeFile) => {
    setOpenFiles((prev) => {
      if (!prev.includes(file.id)) {
        return [...prev, file.id];
      }
      return prev;
    });
    setActiveFileId(file.id);
  }, []);

  // Cerrar archivo
  const closeFile = useCallback((fileId: string) => {
    setOpenFiles((prev) => {
      const newOpenFiles = prev.filter((id) => id !== fileId);
      setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
      return newOpenFiles;
    });
  }, []);

  // Establecer archivo activo
  const setActiveFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  // Obtener archivo activo
  const activeFile = files.find((f) => f.id === activeFileId) || null;

  // Obtener archivos abiertos
  const openFilesList = files.filter((f) => openFiles.includes(f.id));

  return {
    openFiles: openFilesList,
    activeFile,
    openFile,
    closeFile,
    setActiveFile,
  };
};
