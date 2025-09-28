import type { StoreSchema } from '@/data-schema';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { CreatePageInput, createPageSchema, UpdatePageInput, updatePageSchema } from '@/lib/zod-schemas/page';
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useCallback, useState } from 'react';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

// Clave base para las consultas de páginas
const PAGES_KEY = 'pages';

/**
 * Interfaz para los items de página (objetos JavaScript)
 */

export type Page = StoreSchema['Page']['type'];
export type PageSummary = Pick<Page, 'id' | 'title' | 'slug' | 'isVisible' | 'status' | 'createdAt' | 'pageType'>;
export type { CreatePageInput, UpdatePageInput };

export const usePages = (storeId: string) => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  const { invalidatePageCache } = useCacheInvalidation();

  const performOperation = async <T>(
    operation: () => Promise<{ data: T | null; errors?: any[] }>
  ): Promise<T | null> => {
    setError(null);
    try {
      const result = await operation();
      if (result.errors && result.errors.length > 0) {
        setError(result.errors);
        throw new Error(result.errors[0].message || 'Operation error');
      }
      return result.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const useListPagesByStore = (): UseQueryResult<PageSummary[], Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, 'list', storeId],
      queryFn: async () => {
        if (!storeId) {
          throw new Error('Store ID is required to list pages.');
        }
        const response = await performOperation(() =>
          client.models.Page.listPageByStoreId(
            { storeId },
            { selectionSet: ['id', 'title', 'slug', 'isVisible', 'status', 'createdAt', 'pageType'] }
          )
        );
        return response || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!storeId,
    });
  };

  const useListPageSummaries = (): UseQueryResult<PageSummary[], Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, 'list', storeId, 'summary'],
      queryFn: async () => {
        if (!storeId) {
          throw new Error('Store ID is required to list page summaries.');
        }
        // Usamos .list() con selectionSet para traer solo los datos necesarios
        const { data: pages, errors } = await client.models.Page.listPageByStoreId(
          {
            storeId,
          },
          { selectionSet: ['id', 'title', 'slug', 'pageType'] }
        );

        if (errors) {
          console.error('Error fetching page summaries:', errors);
          throw new Error('Error al cargar el resumen de páginas.');
        }

        return (pages as PageSummary[]) || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!storeId,
    });
  };

  const useGetPage = (id: string): UseQueryResult<Page | null, Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, id],
      queryFn: () => {
        if (!id) return null;
        return performOperation(() => client.models.Page.get({ id }));
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    });
  };

  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s\-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }, []);

  const useCreatePage = () => {
    return useMutation({
      mutationFn: async (pageInput: CreatePageInput) => {
        const { username } = await getCurrentUser();
        const validatedInput = createPageSchema.parse(pageInput);
        return performOperation(() => client.models.Page.create({ ...validatedInput, owner: username }));
      },
      onSuccess: async (_newPage) => {
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] });

        // Invalidar caché del motor de renderizado
        await invalidatePageCache(storeId);
      },
    });
  };

  const useUpdatePage = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) => {
        const validatedInput = updatePageSchema.parse(data);
        return performOperation(() =>
          client.models.Page.update({
            id,
            ...validatedInput,
          })
        );
      },
      onSuccess: async (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] });

        // Invalidar caché del motor de renderizado
        await invalidatePageCache(storeId, variables.id);
      },
    });
  };

  const useDeletePage = () => {
    return useMutation({
      mutationFn: (id: string) => {
        if (!id) {
          throw new Error('Page ID is required for deletion');
        }
        return performOperation(() => client.models.Page.delete({ id }));
      },
      onSuccess: async (_data, deletedId) => {
        queryClient.removeQueries({ queryKey: [PAGES_KEY, deletedId] });
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] });

        // Invalidar caché del motor de renderizado
        await invalidatePageCache(storeId, deletedId);
      },
    });
  };

  return {
    error,
    useListPagesByStore,
    useListPageSummaries,
    useGetPage,
    useCreatePage,
    useUpdatePage,
    useDeletePage,
    generateSlug,
    validateCreatePage: createPageSchema,
    validateUpdatePage: updatePageSchema,
  };
};
