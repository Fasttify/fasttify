import { useMutation, useQueryClient } from '@tanstack/react-query';
import { themeFileApi } from '../../api/themeFileApi';
import { THEME_FILES_KEY } from '../queries/useThemeFiles';

export const useSaveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themeFileApi.saveFile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [THEME_FILES_KEY, variables.storeId, variables.themeId],
      });
    },
  });
};
