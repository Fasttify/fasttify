import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface UseEditorContentProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  debounceMs?: number;
}

export const useEditorContent = ({ initialContent, onContentChange, debounceMs = 300 }: UseEditorContentProps) => {
  const [content, setContent] = useState(initialContent);
  const debouncedContent = useDebounce(content, debounceMs);
  const lastProcessedContent = useRef(initialContent);
  const isInitialized = useRef(false);

  // Actualizar el contenido cuando cambie el archivo inicial
  useEffect(() => {
    if (!isInitialized.current) {
      setContent(initialContent);
      lastProcessedContent.current = initialContent;
      isInitialized.current = true;
    } else if (initialContent !== lastProcessedContent.current) {
      // Solo actualizar si el contenido realmente cambió (nuevo archivo)
      setContent(initialContent);
      lastProcessedContent.current = initialContent;
    }
  }, [initialContent]);

  // Actualizar el contenido inmediatamente para el editor
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Procesar el contenido con debounce
  const processDebouncedContent = useCallback(() => {
    if (debouncedContent !== lastProcessedContent.current) {
      lastProcessedContent.current = debouncedContent;
      onContentChange(debouncedContent);
    }
  }, [debouncedContent, onContentChange]);

  return {
    content,
    handleContentChange,
    processDebouncedContent,
  };
};
