import { useCallback } from 'react';

interface UseEditorSavingProps {
  fileOperations: any; // TODO: Tipar correctamente
  editorState: any; // TODO: Tipar correctamente
}

export const useEditorSaving = ({ fileOperations, editorState }: UseEditorSavingProps) => {
  // Guardar archivo y marcar como guardado
  const saveFile = useCallback(
    async (fileId: string) => {
      try {
        await fileOperations.saveFile(fileId);
        editorState.markAsSaved();
      } catch (err) {
        // El error ya se maneja en fileOperations
      }
    },
    [fileOperations, editorState]
  );

  // Guardar todos los archivos y marcar como guardado
  const saveAll = useCallback(async () => {
    try {
      await fileOperations.saveAllFiles();
      editorState.markAsSaved();
    } catch (err) {
      // El error ya se maneja en fileOperations
    }
  }, [fileOperations, editorState]);

  return {
    saveFile,
    saveAll,
  };
};
