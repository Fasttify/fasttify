import { useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { MonacoEditorProps } from '../types/editor-types';
import { getLanguage } from '../utils';

export const MonacoEditor = ({
  file,
  theme,
  fontSize,
  wordWrap,
  minimap,
  onContentChange,
  onEditorReady,
  onError,
}: MonacoEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    onEditorReady();
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Selecciona un archivo para editarlo</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: '500px', minHeight: '400px' }}>
      <Editor
        height="500px"
        language={getLanguage(file.type)}
        theme={theme}
        value={file.content}
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
          cursorStyle: 'line',
          cursorBlinking: 'blink',
          folding: true,
          lineNumbers: 'on',
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
