import { useEffect, useCallback } from 'react';
import { ThemeEditorProps } from '../types/editor-types';
import { useThemeFiles } from './queries';
import { useFileManagement } from './useFileManagement';
import { useFileOperations } from './useFileOperations';
import { useEditorState } from './useEditorState';
import { useFileContent } from './useFileContent';

export const useThemeEditor = (props: ThemeEditorProps) => {
  const {
    storeId,
    themeId,
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
    data: files = [],
    isLoading,
    error: queryError,
  } = useThemeFiles(storeId, themeId, !initialFiles || initialFiles.length === 0);

  // Usar archivos iniciales si se proporcionan
  const finalFiles = initialFiles && initialFiles.length > 0 ? initialFiles : files;

  const fileManagement = useFileManagement(finalFiles);
  const editorState = useEditorState();
  const fileOperations = useFileOperations({
    files: finalFiles,
    storeId,
    themeId,
    onSave,
    onError,
  });
  const fileContent = useFileContent({
    files: finalFiles,
    onFileChange,
    onMarkAsModified: editorState.markAsModified,
  });

  // Abrir automáticamente el primer archivo cuando se cargan los archivos
  useEffect(() => {
    if (finalFiles.length > 0 && !fileManagement.activeFile) {
      fileManagement.openFile(finalFiles[0]);
    }
  }, [finalFiles, fileManagement.activeFile, fileManagement.openFile]);

  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Error al cargar archivos';
      onError?.(errorMessage);
    }
  }, [queryError, onError]);

  // Cerrar editor con confirmación
  const handleClose = useCallback(() => {
    if (editorState.hasUnsavedChanges) {
      const shouldClose = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?');
      if (!shouldClose) return;
    }

    editorState.reset();
    onClose?.();
  }, [editorState, onClose]);

  // Guardar archivo y marcar como guardado
  const handleSaveFile = useCallback(
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
  const handleSaveAll = useCallback(async () => {
    try {
      await fileOperations.saveAllFiles();
      editorState.markAsSaved();
    } catch (err) {
      // El error ya se maneja en fileOperations
    }
  }, [fileOperations, editorState]);

  return {
    // Estado
    files: finalFiles,
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
    openFile: fileManagement.openFile,
    closeFile: fileManagement.closeFile,
    setActiveFile: fileManagement.setActiveFile,
    handleContentChange: fileContent.updateFileContent,
    handleSaveFile,
    handleSaveAll,
    handleClose,

    // Configuración
    theme,
    fontSize,
    wordWrap,
    minimap,
  };
};
