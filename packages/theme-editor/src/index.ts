// Componentes principales
export { ThemeEditor } from './components/ThemeEditor';
export { MonacoEditor } from './components/MonacoEditor';

// Hooks (todos los hooks modulares)
export {
  useThemeEditor,
  useFileManagement,
  useFileOperations,
  useEditorState,
  useFileContent,
  useThemeFiles,
  THEME_FILES_KEY,
  useSaveFile,
  useCreateFile,
  useDeleteFile,
  useRenameFile,
} from './hooks';

export { themeFileApi } from './api';
export type { LoadThemeFilesParams, SaveFileParams, CreateFileParams, DeleteFileParams, RenameFileParams } from './api';

export { generateFileId, getFileName, getFileType, createThemeFileFromServer, createNewThemeFile } from './utils';

export type {
  ThemeFile,
  ThemeEditorState,
  ThemeEditorActions,
  ThemeEditorProps,
  FileTreeProps,
  EditorTabsProps,
  MonacoEditorProps,
  EditorToolbarProps,
  EditorLayoutProps,
  ThemeFileService,
  LiquidLanguageService,
} from './types/editor-types';
