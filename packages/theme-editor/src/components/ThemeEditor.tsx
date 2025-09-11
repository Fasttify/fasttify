import { ThemeEditorProps } from '../types/editor-types';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { useEditorAnimations } from '../styles/useEditorAnimations';
import { AnimationProvider } from '../providers/AnimationProvider';
import { EditorTabs } from './EditorTabs';
import { EditorHeader } from './EditorHeader';
import { EditorSidebar } from './EditorSidebar';
import { EditorMainArea } from './EditorMainArea';
import { EditorLoadingState } from './EditorLoadingState';
import { EditorErrorState } from './EditorErrorState';

const ThemeEditorContent = (props: ThemeEditorProps) => {
  const {
    files,
    openFiles,
    activeFile,
    isLoading,
    error,
    hasUnsavedChanges,
    isSaving,
    openFile,
    closeFile,
    setActiveFile,
    handleContentChange,
    handleSaveAll,
    handleClose,
    handleCreateItem,
    handleRenameFile,
    handleDeleteFile,
    handleCopyFile,
    handleDownloadFile,
    theme,
    fontSize,
    wordWrap,
    minimap,
    isLoadingFile,
  } = useThemeEditor(props);

  const animations = useEditorAnimations();

  if (isLoading) {
    return <EditorLoadingState />;
  }

  if (error) {
    return <EditorErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className={`h-full flex flex-col bg-white ${animations.container}`} style={{ minHeight: '500px' }}>
      <EditorHeader
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSaveAll={handleSaveAll}
        onClose={handleClose}
      />

      <EditorTabs
        openFiles={openFiles}
        activeFileId={activeFile?.id}
        onTabSelect={setActiveFile}
        onTabClose={closeFile}
      />

      <div className={`flex-1 flex ${animations.mainArea}`}>
        <EditorSidebar
          storeId={props.storeId}
          activeFileId={activeFile?.id}
          onFileSelect={(file) => openFile(file)}
          onCreateItem={handleCreateItem}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onCopyFile={handleCopyFile}
          onDownloadFile={handleDownloadFile}
        />

        <EditorMainArea
          activeFile={activeFile || null}
          theme={theme}
          fontSize={fontSize}
          wordWrap={wordWrap}
          minimap={minimap}
          isLoadingFile={activeFile ? isLoadingFile(activeFile.id) : false}
          onContentChange={(content) => activeFile && handleContentChange(activeFile.id, content)}
          onEditorReady={() => {}}
          onError={(error) => console.error('Editor error:', error)}
        />
      </div>
    </div>
  );
};

export const ThemeEditor = (props: ThemeEditorProps) => {
  return (
    <AnimationProvider>
      <ThemeEditorContent {...props} />
    </AnimationProvider>
  );
};
