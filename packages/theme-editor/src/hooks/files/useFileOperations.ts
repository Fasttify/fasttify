import { useCallback, useState } from 'react';
import { ThemeFile } from '../../types/editor-types';

interface UseFileOperationsProps {
  files: ThemeFile[];
  storeId: string;
  onSave?: (file: ThemeFile) => void;
  onError?: (message: string) => void;
}

export const useFileOperations = ({ files, storeId, onSave, onError }: UseFileOperationsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const saveFile = useCallback(
    async (fileId: string) => {
      try {
        setIsSaving(true);
        const file = files.find((f) => f.id === fileId);
        if (!file) {
          throw new Error('Archivo no encontrado');
        }

        // TODO: Implementar llamada real al backend
        console.log('Guardando archivo:', file.path, file.content);

        // Simular delay de guardado
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSave?.(file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al guardar archivo';
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [files, onSave, onError]
  );

  const saveAllFiles = useCallback(async () => {
    try {
      setIsSaving(true);
      const modifiedFiles = files.filter((f) => f.isModified);

      for (const file of modifiedFiles) {
        await saveFile(file.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar archivos';
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [files, saveFile, onError]);

  const createFile = useCallback(
    async (path: string, content: string): Promise<ThemeFile> => {
      try {
        setIsCreating(true);

        // TODO: Implementar llamada real al backend
        console.log('Creando archivo:', path, content);

        // Simular delay de creación
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newFile: ThemeFile = {
          id: `file_${Date.now()}`,
          name: path.split('/').pop() || 'nuevo-archivo',
          path,
          content,
          type: 'file',
          isModified: false,
        };

        return newFile;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear archivo';
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [onError]
  );

  const deleteFile = useCallback(
    async (path: string) => {
      try {
        setIsDeleting(true);

        // TODO: Implementar llamada real al backend
        console.log('Eliminando archivo:', path);

        // Simular delay de eliminación
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivo';
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [onError]
  );

  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      try {
        setIsRenaming(true);

        // TODO: Implementar llamada real al backend
        console.log('Renombrando archivo:', oldPath, '->', newPath);

        // Simular delay de renombrado
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al renombrar archivo';
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsRenaming(false);
      }
    },
    [onError]
  );

  return {
    saveFile,
    saveAllFiles,
    createFile,
    deleteFile,
    renameFile,
    isSaving,
    isCreating,
    isDeleting,
    isRenaming,
  };
};
