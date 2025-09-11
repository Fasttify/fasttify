import { useState, useRef } from 'react';
import { Text } from '@shopify/polaris';
import { Plus } from 'lucide-react';
import { ThemeFileTree } from './theme-file-tree';
import { ThemeFile } from '../types/editor-types';
import { useEditorAnimations } from '../styles/useEditorAnimations';
import { CreateItemContextMenu, ItemType } from './CreateItemContextMenu';

interface EditorSidebarProps {
  storeId: string;
  activeFileId?: string;
  onFileSelect: (file: ThemeFile) => void;
  onCreateItem?: (name: string, type: ItemType, parentPath?: string) => void;
  onRenameFile?: (fileId: string, newName: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onCopyFile?: (file: ThemeFile) => void;
  onDownloadFile?: (file: ThemeFile) => void;
}

export const EditorSidebar = ({
  storeId,
  activeFileId,
  onFileSelect,
  onCreateItem,
  onRenameFile,
  onDeleteFile,
  onCopyFile,
  onDownloadFile,
}: EditorSidebarProps) => {
  const animations = useEditorAnimations();
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenuPosition({
        x: rect.left,
        y: rect.bottom + 4,
      });
      setIsContextMenuOpen(true);
    }
  };

  const handleCreateItem = async (name: string, type: ItemType, parentPath?: string) => {
    await onCreateItem?.(name, type, parentPath);
    setIsContextMenuOpen(false);
  };

  return (
    <>
      <div className={`w-80 border-r bg-gray-50 flex flex-col ${animations.sidebar}`}>
        {/* Header con botón de crear */}
        <div className="p-3 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <Text as="h3" variant="headingSm" fontWeight="semibold">
              Archivos del Tema
            </Text>
          </div>

          {/* Botón principal de crear */}
          <button
            ref={buttonRef}
            onClick={handleCreateClick}
            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo archivo
          </button>
        </div>

        {/* Árbol de archivos */}
        <div className="flex-1 overflow-hidden">
          <ThemeFileTree
            storeId={storeId}
            onFileSelect={onFileSelect}
            selectedFileId={activeFileId}
            className="h-full"
            onRename={onRenameFile}
            onDelete={onDeleteFile}
            onCopy={onCopyFile}
            onDownload={onDownloadFile}
          />
        </div>
      </div>

      {/* Menú contextual de crear */}
      <CreateItemContextMenu
        isOpen={isContextMenuOpen}
        onClose={() => setIsContextMenuOpen(false)}
        onCreate={handleCreateItem}
        existingItems={[]} // TODO: Pasar lista de archivos existentes
        position={contextMenuPosition}
      />
    </>
  );
};
