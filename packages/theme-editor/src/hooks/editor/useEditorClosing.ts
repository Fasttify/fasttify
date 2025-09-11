import { useCallback } from 'react';

interface UseEditorClosingProps {
  editorState: any; // TODO: Tipar correctamente
  onClose?: () => void;
}

export const useEditorClosing = ({ editorState, onClose }: UseEditorClosingProps) => {
  // Cerrar editor con confirmación
  const handleClose = useCallback(() => {
    if (editorState.hasUnsavedChanges) {
      const shouldClose = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?');
      if (!shouldClose) return;
    }

    editorState.reset();
    onClose?.();
  }, [editorState, onClose]);

  return {
    handleClose,
  };
};
