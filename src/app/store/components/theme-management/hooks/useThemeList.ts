'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  fileCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
}

interface UseThemeListReturn {
  themes: Theme[];
  loading: boolean;
  error: string | null;
  activateTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => void;
}

// Función para obtener temas
const fetchThemes = async (storeId: string): Promise<Theme[]> => {
  const response = await fetch(`/api/stores/${storeId}/themes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  return data.themes || [];
};

// Función para activar tema
const activateTheme = async ({ storeId, themeId }: { storeId: string; themeId: string }): Promise<void> => {
  const response = await fetch(`/api/stores/${storeId}/themes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      themeId,
      isActive: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
  }
};

// Función para eliminar tema
const deleteTheme = async ({ storeId, themeId }: { storeId: string; themeId: string }): Promise<void> => {
  const response = await fetch(`/api/stores/${storeId}/themes?themeId=${themeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
  }
};

export function useThemeList(storeId: string): UseThemeListReturn {
  const queryClient = useQueryClient();

  // Query para obtener temas con cache
  const {
    data: themes = [],
    isLoading: loading,
    error,
    refetch: refreshThemes,
  } = useQuery({
    queryKey: ['themes', storeId],
    queryFn: () => fetchThemes(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Mutation para activar tema
  const activateThemeMutation = useMutation({
    mutationFn: activateTheme,
    onSuccess: () => {
      // Invalidar y refetch la query de temas
      queryClient.invalidateQueries({ queryKey: ['themes', storeId] });
    },
    onError: (error) => {
      console.error('Error activating theme:', error);
    },
  });

  // Mutation para eliminar tema
  const deleteThemeMutation = useMutation({
    mutationFn: deleteTheme,
    onSuccess: () => {
      // Invalidar y refetch la query de temas
      queryClient.invalidateQueries({ queryKey: ['themes', storeId] });
    },
    onError: (error) => {
      console.error('Error deleting theme:', error);
    },
  });

  return {
    themes,
    loading,
    error: error ? (error as Error).message : null,
    activateTheme: (themeId: string) => activateThemeMutation.mutateAsync({ storeId, themeId }),
    deleteTheme: (themeId: string) => deleteThemeMutation.mutateAsync({ storeId, themeId }),
    refreshThemes: () => refreshThemes(),
  };
}
