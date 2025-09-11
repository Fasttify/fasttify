import { Text } from '@shopify/polaris';
import { ThemeFileTree } from './theme-file-tree';
import { ThemeFile } from '../types/editor-types';
import { useEditorAnimations } from '../styles/useEditorAnimations';

interface EditorSidebarProps {
  storeId: string;
  activeFileId?: string;
  onFileSelect: (file: ThemeFile) => void;
}

export const EditorSidebar = ({ storeId, activeFileId, onFileSelect }: EditorSidebarProps) => {
  const animations = useEditorAnimations();

  return (
    <div className={`w-80 border-r bg-gray-50 flex flex-col ${animations.sidebar}`}>
      <div className="p-3 border-b bg-white">
        <Text as="h3" variant="headingSm" fontWeight="semibold">
          Archivos del Tema
        </Text>
      </div>
      <div className="flex-1 overflow-hidden">
        <ThemeFileTree storeId={storeId} onFileSelect={onFileSelect} selectedFileId={activeFileId} className="h-full" />
      </div>
    </div>
  );
};
