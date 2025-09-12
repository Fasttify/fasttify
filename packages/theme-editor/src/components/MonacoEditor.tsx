import { useRef, useMemo, useCallback, useEffect, memo } from 'react';
import { Editor } from '@monaco-editor/react';
import { FileText } from 'lucide-react';
import { MonacoEditorProps } from '../types/editor-types';
import { getLanguage } from '../utils';
import { useEditorContent } from '../hooks/useEditorContent';
import { FileLoadingSpinner } from './ui/FileLoadingSpinner';

const MonacoEditorComponent = ({
  file,
  theme,
  fontSize,
  wordWrap,
  minimap,
  isLoadingFile,
  onContentChange,
  onEditorReady,
  onError,
}: MonacoEditorProps) => {
  const editorRef = useRef<any>(null);

  // Usar el hook de contenido con debouncing
  const { content, handleContentChange, processDebouncedContent } = useEditorContent({
    initialContent: file?.content || '',
    onContentChange,
    debounceMs: 300,
  });

  // Procesar el contenido con debounce cuando cambie
  useEffect(() => {
    processDebouncedContent();
  }, [processDebouncedContent]);

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      onEditorReady();
    },
    [onEditorReady]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        handleContentChange(value);
      }
    },
    [handleContentChange]
  );

  const language = useMemo(() => getLanguage(file?.type || 'other'), [file?.type]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FileText className="w-16 h-16 text-gray-800 mb-4" />
        <p className="text-lg font-medium text-gray-600">Selecciona un archivo para editarlo</p>
        <p className="text-sm text-gray-400 mt-2">
          Haz clic en cualquier archivo del panel lateral para comenzar a editar
        </p>
      </div>
    );
  }

  // Mostrar loader si el archivo se está cargando
  if (isLoadingFile) {
    return <FileLoadingSpinner fileName={file.name} />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: minimap },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          cursorStyle: 'line',
          cursorBlinking: 'expand',
          folding: true,
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
};

export const MonacoEditor = memo(MonacoEditorComponent, (prevProps, nextProps) => {
  return (
    prevProps.file?.id === nextProps.file?.id &&
    prevProps.file?.content === nextProps.file?.content &&
    prevProps.theme === nextProps.theme &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.wordWrap === nextProps.wordWrap &&
    prevProps.minimap === nextProps.minimap
  );
});
