import { useCallback, useRef, useEffect } from 'react';
import { ThemeFile } from '../../types/editor-types';

interface UseEditorContentProps {
  files: ThemeFile[];
  setFiles: React.Dispatch<React.SetStateAction<ThemeFile[]>>;
  editorState: any; // TODO: Tipar correctamente
  onFileChange?: (path: string, content: string) => void;
}

export const useEditorContent = ({ files, setFiles, editorState, onFileChange }: UseEditorContentProps) => {
  const onFileChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback(
    (fileId: string, content: string) => {
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.map((f) => (f.id === fileId ? { ...f, content, isModified: true } : f));
        const file = updatedFiles.find((f) => f.id === fileId);

        // Debounce onFileChange para evitar llamadas excesivas
        if (file && onFileChange) {
          if (onFileChangeTimeoutRef.current) {
            clearTimeout(onFileChangeTimeoutRef.current);
          }
          onFileChangeTimeoutRef.current = setTimeout(() => {
            onFileChange(file.path, content);
          }, 500); // 500ms de debounce para onFileChange
        }

        return updatedFiles;
      });
      // Solo marcar como modificado si no estaba ya marcado
      if (!editorState.hasUnsavedChanges) {
        editorState.markAsModified();
      }
    },
    [onFileChange, editorState, setFiles]
  );

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (onFileChangeTimeoutRef.current) {
        clearTimeout(onFileChangeTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleContentChange,
  };
};
