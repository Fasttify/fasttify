import { useQuery } from '@tanstack/react-query';
import { useThemeWorker } from '../workers';

export const THEME_FILES_KEY = 'theme-files';

export const useThemeFiles = (storeId: string, enabled: boolean = true) => {
  const { loadThemeFiles } = useThemeWorker();

  return useQuery({
    queryKey: [THEME_FILES_KEY, storeId],
    queryFn: () => loadThemeFiles(storeId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false, // No refetch al cambiar de ventana
    refetchOnMount: false, // No refetch al montar si ya hay datos
    retry: 2, // Solo 2 reintentos
    retryDelay: 1000, // 1 segundo entre reintentos
  });
};
