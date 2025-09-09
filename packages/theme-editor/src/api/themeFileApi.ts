import { ThemeFile } from '../types/editor-types';
import { createThemeFileFromServer, createNewThemeFile } from '../utils';

// Tipos para las funciones de la API
export interface LoadThemeFilesParams {
  storeId: string;
  themeId: string;
}

export interface SaveFileParams {
  storeId: string;
  themeId: string;
  filePath: string;
  content: string;
}

export interface CreateFileParams {
  storeId: string;
  themeId: string;
  filePath: string;
  content: string;
}

export interface DeleteFileParams {
  storeId: string;
  themeId: string;
  filePath: string;
}

export interface RenameFileParams {
  storeId: string;
  themeId: string;
  oldPath: string;
  newPath: string;
}

// API functions
export const themeFileApi = {
  async loadThemeFiles({ storeId, themeId }: LoadThemeFilesParams): Promise<ThemeFile[]> {
    const response = await fetch(`/api/themes/${themeId}/files?storeId=${storeId}`);

    if (!response.ok) {
      throw new Error(`Failed to load files: ${response.statusText}`);
    }

    const data = await response.json();

    return data.files.map((file: any) => createThemeFileFromServer(file));
  },

  async saveFile({ storeId, themeId, filePath, content }: SaveFileParams) {
    const response = await fetch(`/api/themes/${themeId}/files`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        filePath,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.statusText}`);
    }

    return { filePath, content };
  },

  async createFile({ storeId, themeId, filePath, content }: CreateFileParams): Promise<ThemeFile> {
    const response = await fetch(`/api/themes/${themeId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        filePath,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create file: ${response.statusText}`);
    }

    const data = await response.json();

    return createNewThemeFile(filePath, content, data.id);
  },

  async deleteFile({ storeId, themeId, filePath }: DeleteFileParams) {
    const response = await fetch(`/api/themes/${themeId}/files`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        filePath,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    return { filePath };
  },

  async renameFile({ storeId, themeId, oldPath, newPath }: RenameFileParams) {
    const response = await fetch(`/api/themes/${themeId}/files/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        oldPath,
        newPath,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to rename file: ${response.statusText}`);
    }

    return { oldPath, newPath };
  },
};
