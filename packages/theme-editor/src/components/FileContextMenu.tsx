import { useState, useCallback, useEffect, useRef } from 'react';
import { Edit, Trash2, Copy, Download } from 'lucide-react';
import { ThemeFile } from '../types/editor-types';
import { useFileNameValidation } from '../hooks/ui/useFileNameValidation';
import { ContextMenuBase } from './ui/ContextMenuBase';

interface FileContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  file: ThemeFile | null;
  position: { x: number; y: number };
  existingItems?: string[];
  onRename?: (fileId: string, newName: string) => void;
  onDelete?: (fileId: string) => void;
  onCopy?: (file: ThemeFile) => void;
  onDownload?: (file: ThemeFile) => void;
}

export const FileContextMenu = ({
  isOpen,
  onClose,
  file,
  position,
  existingItems = [],
  onRename,
  onDelete,
  onCopy,
  onDownload,
}: FileContextMenuProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { validateName } = useFileNameValidation({
    existingItems,
    fileType: 'file',
  });

  // Resetear el estado cuando se abre el menú
  useEffect(() => {
    if (isOpen && file) {
      setIsRenaming(false);
      setNewName(file.name);
      setError('');
    }
  }, [isOpen, file]);

  // Auto-focus en el input cuando se activa el modo renombrar
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = useCallback(() => {
    if (!file) return;

    const validationError = validateName(newName);
    if (validationError) {
      setError(validationError);
      return;
    }

    onRename?.(file.id, newName.trim());
    setIsRenaming(false);
    onClose();
  }, [file, newName, validateName, onRename, onClose]);

  const handleDelete = useCallback(() => {
    if (!file) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar "${file.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      onDelete?.(file.id);
      onClose();
    }
  }, [file, onDelete, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRename();
      } else if (e.key === 'Escape') {
        setIsRenaming(false);
        setNewName(file?.name || '');
        setError('');
      }
    },
    [handleRename, file?.name]
  );

  if (!isOpen || !file) return null;

  return (
    <ContextMenuBase isOpen={isOpen} onClose={onClose} position={position}>
      {isRenaming ? (
        /* Modo renombrado - diseño minimalista */
        <div className="p-2">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Nombre del archivo"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      ) : (
        /* Menú de acciones - estilo VS Code */
        <div className="py-1">
          <button
            onClick={() => setIsRenaming(true)}
            className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Edit className="w-4 h-4 mr-3" />
            Renombrar
          </button>

          <button
            onClick={() => {
              onCopy?.(file);
              onClose();
            }}
            className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Copy className="w-4 h-4 mr-3" />
            Copiar
          </button>

          <button
            onClick={() => {
              onDownload?.(file);
              onClose();
            }}
            className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-3" />
            Descargar
          </button>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            onClick={handleDelete}
            className="w-full flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4 mr-3" />
            Eliminar
          </button>
        </div>
      )}
    </ContextMenuBase>
  );
};
