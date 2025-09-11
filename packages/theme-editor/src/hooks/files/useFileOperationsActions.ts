import { useCallback } from 'react';
import { ThemeFile } from '../../types/editor-types';
import { ItemType } from '../../components/CreateItemContextMenu';

interface UseFileOperationsProps {
  files: ThemeFile[];
  setFiles: React.Dispatch<React.SetStateAction<ThemeFile[]>>;
  fileOperations: any; // TODO: Tipar correctamente
  fileManagement: any; // TODO: Tipar correctamente
  openFile: (file: ThemeFile) => void;
  onError?: (message: string) => void;
}

export const useFileOperationsActions = ({
  files,
  setFiles,
  fileOperations,
  fileManagement,
  openFile,
  onError,
}: UseFileOperationsProps) => {
  // Crear nuevo archivo o carpeta
  const createItem = useCallback(
    async (name: string, type: ItemType, parentPath?: string) => {
      try {
        const fullPath = parentPath ? `${parentPath}/${name}` : name;

        if (type === 'file') {
          // Crear archivo usando fileOperations
          const newFile = await fileOperations.createFile(fullPath, '');

          // Agregar el archivo al estado local
          setFiles((prevFiles) => [...prevFiles, newFile]);

          // Abrir el archivo automáticamente
          openFile(newFile);
        } else {
          // Para carpetas, por ahora solo mostrar un mensaje
          // TODO: Implementar creación de carpetas en el backend
          console.log('Crear carpeta:', fullPath);
          onError?.('La creación de carpetas aún no está implementada');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear el elemento';
        onError?.(errorMessage);
      }
    },
    [fileOperations, openFile, onError, setFiles]
  );

  // Renombrar archivo
  const renameFile = useCallback(
    async (fileId: string, newName: string) => {
      try {
        const file = files.find((f) => f.id === fileId);
        if (!file) return;

        const newPath = file.path.replace(file.name, newName);
        await fileOperations.renameFile(file.path, newPath);

        // Actualizar el estado local
        setFiles((prevFiles) => prevFiles.map((f) => (f.id === fileId ? { ...f, name: newName, path: newPath } : f)));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al renombrar archivo';
        onError?.(errorMessage);
      }
    },
    [files, fileOperations, onError, setFiles]
  );

  // Eliminar archivo
  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        const file = files.find((f) => f.id === fileId);
        if (!file) return;

        await fileOperations.deleteFile(file.path);

        // Remover del estado local
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));

        // Cerrar el archivo si está abierto
        fileManagement.closeFile(fileId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivo';
        onError?.(errorMessage);
      }
    },
    [files, fileOperations, fileManagement, onError, setFiles]
  );

  return {
    createItem,
    renameFile,
    deleteFile,
  };
};
