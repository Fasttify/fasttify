export interface ThemeFile {
  id: string;
  path: string;
  name: string;
  content: string;
  type: 'liquid' | 'css' | 'js' | 'json' | 'html' | 'other';
  size: number;
  lastModified: Date;
  isModified: boolean;
  isOpen: boolean;
}

export interface ThemeEditorState {
  // Archivos
  files: ThemeFile[];
  openFiles: string[];
  activeFileId: string | null;

  // Editor
  isEditorReady: boolean;
  isLoading: boolean;
  error: string | null;

  // Configuración
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;

  // Estado de guardado
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

export interface ThemeEditorActions {
  // Archivos
  openFile: (file: ThemeFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;

  // Editor
  setEditorReady: (ready: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Configuración
  setTheme: (theme: 'vs-dark' | 'vs-light') => void;
  setFontSize: (size: number) => void;
  setWordWrap: (enabled: boolean) => void;
  setMinimap: (enabled: boolean) => void;

  // Estado
  markAsModified: (fileId: string) => void;
  markAsSaved: (fileId: string) => void;
  reset: () => void;
}

export interface ThemeEditorProps {
  storeId: string;
  onSave?: (filePath: string, content: string) => Promise<void>;
  onClose?: () => void;
  onFileChange?: (filePath: string, content: string) => void;
  onError?: (error: string) => void;
  initialFiles?: ThemeFile[];
  theme?: 'vs-dark' | 'vs-light';
  fontSize?: number;
  wordWrap?: boolean;
  minimap?: boolean;
}

export interface FileTreeProps {
  files: ThemeFile[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileOpen: (file: ThemeFile) => void;
  onFileClose: (fileId: string) => void;
}

export interface EditorTabsProps {
  openFiles: ThemeFile[];
  activeFileId: string | null;
  onTabSelect: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
}

export interface MonacoEditorProps {
  file: ThemeFile | null;
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  onContentChange: (content: string) => void;
  onEditorReady: () => void;
  onError: (error: string) => void;
}

export interface EditorToolbarProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onSaveAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFormat: () => void;
  onSearch: () => void;
  onReplace: () => void;
}

export interface EditorLayoutProps {
  children: React.ReactNode;
  sidebarWidth: number;
  onSidebarResize: (width: number) => void;
}

export interface ThemeFileService {
  loadThemeFiles: (storeId: string) => Promise<ThemeFile[]>;
  saveFile: (storeId: string, filePath: string, content: string) => Promise<void>;
  createFile: (storeId: string, filePath: string, content: string) => Promise<ThemeFile>;
  deleteFile: (storeId: string, filePath: string) => Promise<void>;
  renameFile: (storeId: string, oldPath: string, newPath: string) => Promise<void>;
}

export interface LiquidLanguageService {
  getLanguageConfiguration: () => any;
  getThemeConfiguration: () => any;
  getCompletionItems: (position: any, context: any) => any[];
  getHoverProvider: (position: any) => any;
  getSignatureHelpProvider: (position: any) => any;
}
