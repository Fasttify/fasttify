import { useMutation, useQueryClient } from '@tanstack/react-query';
import { themeFileApi } from '../../api';
import { THEME_FILES_KEY } from '../queries';

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themeFileApi.deleteFile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [THEME_FILES_KEY, variables.storeId],
      });
    },
  });
};
