import { useMutation, useQueryClient } from '@tanstack/react-query';
import { themeFileApi } from '../../api';
import { THEME_FILES_KEY } from '../queries';

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
