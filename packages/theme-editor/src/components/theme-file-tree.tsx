'use client';

import React, { useMemo } from 'react';
import { File, Folder, Tree } from './file-tree';
import { useThemeFiles } from '../hooks/queries';
import { ThemeFile } from '../types/editor-types';

interface ThemeFileTreeProps {
  storeId: string;
  onFileSelect?: (file: ThemeFile) => void;
  selectedFileId?: string;
  className?: string;
}

export function ThemeFileTree({ storeId, onFileSelect, selectedFileId, className }: ThemeFileTreeProps) {
  const { data: files = [], isLoading, error } = useThemeFiles(storeId);

  // Convertir archivos del tema en estructura de árbol con niveles de indentación
  const treeStructure = useMemo(() => {
    if (!files.length) return null;

    const root: any = { children: [] };
    const pathMap = new Map<string, any>();

    files.forEach((file) => {
      const pathParts = file.path.split('/').filter(Boolean);
      let current = root;

      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        const fullPath = pathParts.slice(0, index + 1).join('/');

        if (!pathMap.has(fullPath)) {
          const element = {
            id: isLast ? file.id : `folder_${fullPath}`,
            name: part,
            isSelectable: isLast,
            children: isLast ? undefined : [],
            isFolder: !isLast,
            file: isLast ? file : null,
            level: index, // Agregar nivel de indentación
          };

          current.children.push(element);
          pathMap.set(fullPath, element);
        }

        current = pathMap.get(fullPath);
      });
    });

    return root.children;
  }, [files]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">Cargando archivos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-destructive">Error al cargar archivos</div>
      </div>
    );
  }

  if (!files.length || !treeStructure) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">No hay archivos de tema</div>
      </div>
    );
  }

  const renderTreeElement = (element: any): React.ReactNode => {
    if (element.isFolder && element.children && element.children.length > 0) {
      return (
        <Folder key={element.id} element={element.name} value={element.id} level={element.level}>
          {element.children.map(renderTreeElement)}
        </Folder>
      );
    } else if (!element.isFolder && element.file) {
      return (
        <File
          key={element.id}
          value={element.id}
          isSelect={selectedFileId === element.id}
          level={element.level}
          file={element.file}
          handleSelect={() => onFileSelect?.(element.file)}>
          {element.name}
        </File>
      );
    }
    return null;
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-lg border bg-background ${className}`}>
      <Tree className="overflow-hidden rounded-md bg-background p-2" initialSelectedId={selectedFileId}>
        {treeStructure.map(renderTreeElement)}
      </Tree>
    </div>
  );
}
