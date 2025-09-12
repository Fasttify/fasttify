import { useCallback, useState } from 'react';
import { ThemeFile } from '../../types/editor-types';

interface UseFileOpeningProps {
  files: ThemeFile[];
  setFiles: React.Dispatch<React.SetStateAction<ThemeFile[]>>;
  fileManagement: any; // TODO: Tipar correctamente
  loadFileContent: (storeId: string, path: string) => Promise<string | null>;
  storeId: string;
  onError?: (message: string) => void;
}

export const useFileOpening = ({
  files,
  setFiles,
  fileManagement,
  loadFileContent,
  storeId,
  onError,
}: UseFileOpeningProps) => {
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const openFile = useCallback(
    async (file: ThemeFile) => {
      // Primero abrir el archivo en el file management
      fileManagement.openFile(file);

      // Verificar si el archivo necesita contenido cargado
      const currentFiles = files;
      const fileInState = currentFiles.find((f) => f.id === file.id);

      // Si el archivo existe y no tiene contenido, cargarlo
      if (fileInState && (!fileInState.content || fileInState.content === '')) {
        // Marcar el archivo como cargando
        setLoadingFiles((prev) => new Set(prev).add(file.id));

        try {
          const content = await loadFileContent(storeId, file.path);
          if (content !== null && content !== undefined) {
            setFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? { ...f, content } : f)));
          }
        } catch (e) {
          console.error('Error loading file content:', e);
          onError?.(`Error al cargar el contenido del archivo: ${file.path}`);
        } finally {
          // Remover el archivo del estado de carga
          setLoadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(file.id);
            return newSet;
          });
        }
      }
    },
    [files, storeId, loadFileContent, onError, fileManagement, setFiles]
  );

  const isLoadingFile = useCallback((fileId: string) => loadingFiles.has(fileId), [loadingFiles]);

  return {
    openFile,
    isLoadingFile,
    loadingFiles,
  };
};
