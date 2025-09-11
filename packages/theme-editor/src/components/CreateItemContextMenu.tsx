import { useState, useCallback, useEffect } from 'react';
import { File, Folder, Check } from 'lucide-react';
import { useContextMenu } from '../hooks/ui/useContextMenu';
import { useFileNameValidation } from '../hooks/ui/useFileNameValidation';
import { ContextMenuBase } from './ui/ContextMenuBase';
import { ValidatedInput } from './ui/ValidatedInput';
import { ActionButtons } from './ui/ActionButtons';

export type ItemType = 'file' | 'folder';

interface CreateItemContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: ItemType, parentPath?: string) => void;
  parentPath?: string;
  existingItems: string[];
  position: { x: number; y: number };
}

export const CreateItemContextMenu = ({
  isOpen,
  onClose,
  onCreate,
  parentPath = '',
  existingItems,
  position,
}: CreateItemContextMenuProps) => {
  const [itemType, setItemType] = useState<ItemType>('file');
  const [itemName, setItemName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Hooks reutilizables
  const { menuRef, inputRef } = useContextMenu({
    isOpen,
    onClose,
    autoFocus: true,
  });

  const { validateName } = useFileNameValidation({
    parentPath,
    existingItems,
    fileType: itemType,
  });

  // Resetear el formulario cuando se abre el menú
  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setItemType('file');
      setError('');
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleCreate = useCallback(async () => {
    const validationError = validateName(itemName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    try {
      await onCreate(itemName.trim(), itemType, parentPath);
      onClose();
    } catch (err) {
      setError('Error al crear');
    } finally {
      setIsCreating(false);
    }
  }, [itemName, itemType, parentPath, onCreate, onClose, validateName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [handleCreate, onClose]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setItemName(value);

      // Limpiar error cuando el usuario empiece a escribir
      if (error) {
        setError('');
      }
    },
    [error]
  );

  if (!isOpen) return null;

  return (
    <ContextMenuBase isOpen={isOpen} onClose={onClose} position={position} className="min-w-48" menuRef={menuRef}>
      <div className="py-1">
        {/* Tipo selector - estilo VS Code */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex space-x-1">
            <button
              onClick={() => setItemType('file')}
              className={`flex items-center px-2 py-1 text-xs rounded transition-colors ${
                itemType === 'file'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <File className="w-3 h-3 mr-1" />
              Archivo
            </button>
            <button
              onClick={() => setItemType('folder')}
              className={`flex items-center px-2 py-1 text-xs rounded transition-colors ${
                itemType === 'folder'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <Folder className="w-3 h-3 mr-1" />
              Carpeta
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-3">
          <ValidatedInput
            ref={inputRef}
            value={itemName}
            onChange={setItemName}
            onKeyDown={handleKeyDown}
            placeholder={itemType === 'file' ? 'nombre.css' : 'nombre-carpeta'}
            error={error}
            autoFocus
          />
        </div>

        {/* Actions - estilo minimalista */}
        <div className="px-3 pb-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!itemName.trim() || isCreating}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
              {isCreating ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Crear
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ContextMenuBase>
  );
};
