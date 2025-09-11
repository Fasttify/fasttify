import { useCallback } from 'react';

interface UseFileNameValidationProps {
  parentPath?: string;
  existingItems: string[];
  fileType?: 'file' | 'folder';
}

export const useFileNameValidation = ({
  parentPath = '',
  existingItems,
  fileType = 'file',
}: UseFileNameValidationProps) => {
  const validateName = useCallback(
    (name: string): string => {
      if (!name.trim()) {
        return 'El nombre no puede estar vacío';
      }

      // Verificar caracteres no permitidos
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(name)) {
        return 'Caracteres no permitidos';
      }

      // Verificar nombres reservados
      const reservedNames = [
        'CON',
        'PRN',
        'AUX',
        'NUL',
        'COM1',
        'COM2',
        'COM3',
        'COM4',
        'COM5',
        'COM6',
        'COM7',
        'COM8',
        'COM9',
        'LPT1',
        'LPT2',
        'LPT3',
        'LPT4',
        'LPT5',
        'LPT6',
        'LPT7',
        'LPT8',
        'LPT9',
      ];
      if (reservedNames.includes(name.toUpperCase())) {
        return 'Nombre reservado';
      }

      // Verificar si ya existe
      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      if (existingItems.includes(fullPath)) {
        return 'Ya existe';
      }

      // Para archivos, verificar extensión
      if (fileType === 'file' && !name.includes('.')) {
        return 'Requiere extensión';
      }

      return '';
    },
    [parentPath, existingItems, fileType]
  );

  return {
    validateName,
  };
};
