import { ThemeEditorProps } from '../types/editor-types';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { MonacoEditor } from './MonacoEditor';

export const ThemeEditor = (props: ThemeEditorProps) => {
  const {
    openFiles,
    activeFile,
    isLoading,
    error,
    hasUnsavedChanges,
    isSaving,
    closeFile,
    setActiveFile,
    handleContentChange,
    handleSaveAll,
    handleClose,
    theme,
    fontSize,
    wordWrap,
    minimap,
  } = useThemeEditor(props);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Editor de Tema</h2>
          {hasUnsavedChanges && <span className="text-orange-500 text-sm">● Cambios sin guardar</span>}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveAll}
            disabled={isSaving || !hasUnsavedChanges}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? 'Guardando...' : 'Guardar Todo'}
          </button>

          <button onClick={handleClose} className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
            Cerrar
          </button>
        </div>
      </div>

      {/* Tabs */}
      {openFiles.length > 0 && (
        <div className="flex border-b bg-gray-100">
          {openFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center px-4 py-2 cursor-pointer border-r ${
                activeFile?.id === file.id ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveFile(file.id)}>
              <span className="text-sm">{file.name}</span>
              {file.isModified && <span className="ml-2 text-orange-500">●</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1" style={{ height: '500px', minHeight: '400px' }}>
        <MonacoEditor
          file={activeFile}
          theme={theme}
          fontSize={fontSize}
          wordWrap={wordWrap}
          minimap={minimap}
          onContentChange={(content) => activeFile && handleContentChange(activeFile.id, content)}
          onEditorReady={() => {}}
          onError={(error) => console.error('Editor error:', error)}
        />
      </div>
    </div>
  );
};
