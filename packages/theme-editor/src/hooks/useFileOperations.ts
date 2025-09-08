import { useCallback } from 'react';
import { ThemeFile } from '../types/editor-types';
import { useSaveFile, useCreateFile, useDeleteFile, useRenameFile } from './mutations';

interface UseFileOperationsProps {
  files: ThemeFile[];
  storeId: string;
  themeId: string;
  onSave?: (filePath: string, content: string) => Promise<void>;
  onError?: (error: string) => void;
}

export const useFileOperations = ({ files, storeId, themeId, onSave, onError }: UseFileOperationsProps) => {
  const saveFileMutation = useSaveFile();
  const createFileMutation = useCreateFile();
  const deleteFileMutation = useDeleteFile();
  const renameFileMutation = useRenameFile();

  // Guardar archivo individual
  const saveFile = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      try {
        if (onSave) {
          await onSave(file.path, file.content);
        } else {
          await saveFileMutation.mutateAsync({
            storeId,
            themeId,
            filePath: file.path,
            content: file.content,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al guardar archivo';
        onError?.(errorMessage);
        throw err;
      }
    },
    [files, storeId, themeId, onSave, saveFileMutation, onError]
  );

  // Guardar todos los archivos
  const saveAllFiles = useCallback(async () => {
    try {
      if (onSave) {
        const modifiedFiles = files.filter((f) => f.isModified);
        for (const file of modifiedFiles) {
          await onSave(file.path, file.content);
        }
      } else {
        const modifiedFiles = files.filter((f) => f.isModified);
        for (const file of modifiedFiles) {
          await saveFileMutation.mutateAsync({
            storeId,
            themeId,
            filePath: file.path,
            content: file.content,
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar archivos';
      onError?.(errorMessage);
      throw err;
    }
  }, [files, storeId, themeId, onSave, saveFileMutation, onError]);

  // Crear archivo
  const createFile = useCallback(
    async (filePath: string, content: string) => {
      try {
        if (onSave) {
          await onSave(filePath, content);
          return { id: `file_${filePath}`, path: filePath, content };
        } else {
          return await createFileMutation.mutateAsync({
            storeId,
            themeId,
            filePath,
            content,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear archivo';
        onError?.(errorMessage);
        throw err;
      }
    },
    [storeId, themeId, onSave, createFileMutation, onError]
  );

  // Eliminar archivo
  const deleteFile = useCallback(
    async (filePath: string) => {
      try {
        if (onSave) {
          // Si hay callback personalizado, no hacer nada (el padre maneja la eliminación)
          return;
        } else {
          await deleteFileMutation.mutateAsync({
            storeId,
            themeId,
            filePath,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivo';
        onError?.(errorMessage);
        throw err;
      }
    },
    [storeId, themeId, onSave, deleteFileMutation, onError]
  );

  // Renombrar archivo
  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      try {
        if (onSave) {
          // Si hay callback personalizado, no hacer nada (el padre maneja el renombrado)
          return;
        } else {
          await renameFileMutation.mutateAsync({
            storeId,
            themeId,
            oldPath,
            newPath,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al renombrar archivo';
        onError?.(errorMessage);
        throw err;
      }
    },
    [storeId, themeId, onSave, renameFileMutation, onError]
  );

  return {
    saveFile,
    saveAllFiles,
    createFile,
    deleteFile,
    renameFile,
    isSaving: saveFileMutation.isPending,
    isCreating: createFileMutation.isPending,
    isDeleting: deleteFileMutation.isPending,
    isRenaming: renameFileMutation.isPending,
  };
};
