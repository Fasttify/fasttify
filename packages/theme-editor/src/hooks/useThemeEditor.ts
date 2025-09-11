import { useEffect, useState, useMemo } from 'react';
import { ThemeEditorProps, ThemeFile } from '../types/editor-types';
import { useThemeFiles } from './queries';
import { useFileManagement, useFileOperations } from './files';
import { useEditorState } from './state';
import { useThemeWorker } from './workers';
import { useFileOperationsActions } from './files/useFileOperationsActions';
import { useFileActions } from './files/useFileActions';
import { useEditorContent } from './editor/useEditorContent';
import { useFileOpening } from './editor/useFileOpening';
import { useEditorSaving } from './editor/useEditorSaving';
import { useEditorClosing } from './editor/useEditorClosing';

export const useThemeEditor = (props: ThemeEditorProps) => {
  const {
    storeId,
    onSave,
    onClose,
    onFileChange,
    onError,
    initialFiles,
    theme = 'vs-dark',
    fontSize = 14,
    wordWrap = true,
    minimap = true,
  } = props;

  const {
    data: queryFiles = [],
    isLoading,
    error: queryError,
  } = useThemeFiles(storeId, !initialFiles || initialFiles.length === 0);

  const [files, setFiles] = useState<ThemeFile[]>([]);

  const memoizedFiles = useMemo(() => {
    return initialFiles && initialFiles.length > 0 ? initialFiles : queryFiles;
  }, [initialFiles, queryFiles]);

  useEffect(() => {
    setFiles(memoizedFiles);
  }, [memoizedFiles]);

  const fileManagement = useFileManagement(files);
  const editorState = useEditorState();
  const fileOperations = useFileOperations({
    files: files,
    storeId,
    onSave: onSave
      ? (file: ThemeFile) => {
          onSave(file.path, file.content);
        }
      : undefined,
    onError,
  });

  const { loadFileContent } = useThemeWorker();

  // Hooks especializados
  const { handleContentChange } = useEditorContent({
    files,
    setFiles,
    editorState,
    onFileChange,
  });

  const { openFile, isLoadingFile } = useFileOpening({
    files,
    setFiles,
    fileManagement,
    loadFileContent,
    storeId,
    onError,
  });

  const { saveFile, saveAll } = useEditorSaving({
    fileOperations,
    editorState,
  });

  const { handleClose } = useEditorClosing({
    editorState,
    onClose,
  });

  const { createItem, renameFile, deleteFile } = useFileOperationsActions({
    files,
    setFiles,
    fileOperations,
    fileManagement,
    openFile,
    onError,
  });

  const { copyFile, downloadFile } = useFileActions();

  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Error al cargar archivos';
      onError?.(errorMessage);
    }
  }, [queryError, onError]);

  return {
    // Estado
    files,
    openFiles: fileManagement.openFiles,
    activeFile: fileManagement.activeFile,
    isEditorReady: editorState.isEditorReady,
    isLoading:
      isLoading ||
      fileOperations.isSaving ||
      fileOperations.isCreating ||
      fileOperations.isDeleting ||
      fileOperations.isRenaming,
    error: queryError?.message || null,
    hasUnsavedChanges: editorState.hasUnsavedChanges,
    isSaving: fileOperations.isSaving,

    // Acciones
    openFile,
    closeFile: fileManagement.closeFile,
    setActiveFile: fileManagement.setActiveFile,
    handleContentChange,
    handleSaveFile: saveFile,
    handleSaveAll: saveAll,
    handleClose,
    handleCreateItem: createItem,
    handleRenameFile: renameFile,
    handleDeleteFile: deleteFile,
    handleCopyFile: copyFile,
    handleDownloadFile: downloadFile,

    // Configuración
    theme,
    fontSize,
    wordWrap,
    minimap,

    // Estado de carga
    isLoadingFile,
  };
};
