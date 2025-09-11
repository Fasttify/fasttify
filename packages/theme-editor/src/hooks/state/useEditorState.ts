import { useState, useCallback } from 'react';

export const useEditorState = () => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Marcar como listo
  const setEditorReady = useCallback((ready: boolean) => {
    setIsEditorReady(ready);
  }, []);

  // Marcar cambios sin guardar
  const markAsModified = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Marcar como guardado
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Resetear estado
  const reset = useCallback(() => {
    setIsEditorReady(false);
    setHasUnsavedChanges(false);
  }, []);

  return {
    isEditorReady,
    hasUnsavedChanges,
    setEditorReady,
    markAsModified,
    markAsSaved,
    reset,
  };
};
