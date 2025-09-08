import { useMutation, useQueryClient } from '@tanstack/react-query';
import { themeFileApi } from '../../api/themeFileApi';
import { THEME_FILES_KEY } from '../queries/useThemeFiles';

export const useCreateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themeFileApi.createFile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [THEME_FILES_KEY, variables.storeId, variables.themeId],
      });
    },
  });
};
