import React, { useState, useRef, useCallback } from 'react';
import { FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeFile } from '../types/editor-types';
import { FileContextMenu } from './FileContextMenu';

interface FileWithContextMenuProps {
  file: ThemeFile;
  isSelected?: boolean;
  level?: number;
  existingItems?: string[];
  onFileSelect?: (file: ThemeFile) => void;
  onRename?: (fileId: string, newName: string) => void;
  onDelete?: (fileId: string) => void;
  onCopy?: (file: ThemeFile) => void;
  onDownload?: (file: ThemeFile) => void;
  className?: string;
}

export const FileWithContextMenu = ({
  file,
  isSelected = false,
  level = 0,
  existingItems = [],
  onFileSelect,
  onRename,
  onDelete,
  onCopy,
  onDownload,
  className,
}: FileWithContextMenuProps) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const fileRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onFileSelect?.(file);
  }, [file, onFileSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = fileRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenuPosition({
        x: rect.right - 200, // Posicionar a la izquierda del archivo
        y: rect.top,
      });
      setIsContextMenuOpen(true);
    }
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  const indentStyle = {
    paddingLeft: `${level * 16}px`,
  };

  return (
    <>
      <div
        ref={fileRef}
        style={indentStyle}
        className={cn(
          'flex items-center gap-1 cursor-pointer text-sm pr-1 rounded-md duration-200 ease-in-out hover:bg-gray-100 transition-colors group',
          {
            'bg-blue-50 text-blue-700': isSelected,
          },
          className
        )}
        onClick={handleClick}
        onContextMenu={handleContextMenu}>
        {/* Espacio vacío para alineación con carpetas */}
        <div className="w-4 h-4 flex-shrink-0" />

        {/* Icono del archivo */}
        <div className="flex-shrink-0 mr-1">
          <FileIcon className="w-4 h-4 text-gray-500" />
        </div>

        {/* Nombre del archivo */}
        <span className="flex-1 truncate text-sm">{file.name}</span>

        {/* Indicador de hover para mostrar que tiene menú contextual */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Menú contextual */}
      <FileContextMenu
        isOpen={isContextMenuOpen}
        onClose={handleCloseContextMenu}
        file={file}
        position={contextMenuPosition}
        existingItems={existingItems}
        onRename={onRename}
        onDelete={onDelete}
        onCopy={onCopy}
        onDownload={onDownload}
      />
    </>
  );
};
