import { useQuery } from '@tanstack/react-query';
import { themeFileApi } from '../../api';

export const THEME_FILES_KEY = 'theme-files';

export const useThemeFiles = (storeId: string, themeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [THEME_FILES_KEY, storeId, themeId],
    queryFn: () => themeFileApi.loadThemeFiles({ storeId, themeId }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
